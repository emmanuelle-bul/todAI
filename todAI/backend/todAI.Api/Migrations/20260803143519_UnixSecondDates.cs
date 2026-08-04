using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace todAI.Api.Migrations
{
    /// <inheritdoc />
    public partial class UnixSecondDates : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.Sql(@"
                DECLARE @sql nvarchar(max) = '';
                SELECT @sql += 'ALTER TABLE [Tasks] DROP CONSTRAINT ' + QUOTENAME(d.name) + ';'
                FROM sys.default_constraints d
                INNER JOIN sys.columns c ON d.parent_column_id = c.column_id AND d.parent_object_id = c.object_id
                WHERE d.parent_object_id = OBJECT_ID(N'[Tasks]') AND c.name IN (N'CreatedAt', N'UpdatedAt', N'DueDate');
                IF LEN(@sql) > 0 EXEC(@sql);
            ");

            migrationBuilder.Sql(@"
                CREATE TABLE [Tasks_new] (
                    [Id] int NOT NULL IDENTITY,
                    [Title] nvarchar(200) NOT NULL,
                    [Description] nvarchar(2000) NULL,
                    [Category] nvarchar(max) NULL,
                    [Status] nvarchar(20) NOT NULL,
                    [Priority] nvarchar(20) NOT NULL,
                    [DueDate] bigint NULL,
                    [CreatedAt] bigint NOT NULL,
                    [UpdatedAt] bigint NOT NULL,
                    CONSTRAINT [PK_Tasks_new] PRIMARY KEY ([Id])
                );
            ");

            migrationBuilder.Sql(@"
                INSERT INTO [Tasks_new] ([Title], [Description], [Category], [Status], [Priority], [DueDate], [CreatedAt], [UpdatedAt])
                SELECT [Title], [Description], [Category], [Status], [Priority],
                    CASE WHEN [DueDate] IS NULL THEN NULL ELSE DATEDIFF(second, '1970-01-01', CAST([DueDate] AS datetime2)) END,
                    DATEDIFF(second, '1970-01-01', CAST([CreatedAt] AS datetime2)),
                    DATEDIFF(second, '1970-01-01', CAST([UpdatedAt] AS datetime2))
                FROM [Tasks];
            ");

            migrationBuilder.Sql(@"
                DROP TABLE [Tasks];
                EXEC sp_rename 'Tasks_new', 'Tasks';
            ");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.Sql(@"
                DECLARE @sql nvarchar(max) = '';
                SELECT @sql += 'ALTER TABLE [Tasks] DROP CONSTRAINT ' + QUOTENAME(d.name) + ';'
                FROM sys.default_constraints d
                INNER JOIN sys.columns c ON d.parent_column_id = c.column_id AND d.parent_object_id = c.object_id
                WHERE d.parent_object_id = OBJECT_ID(N'[Tasks]') AND c.name IN (N'CreatedAt', N'UpdatedAt', N'DueDate');
                IF LEN(@sql) > 0 EXEC(@sql);
            ");

            migrationBuilder.Sql(@"
                CREATE TABLE [Tasks_old] (
                    [Id] int NOT NULL IDENTITY,
                    [Title] nvarchar(200) NOT NULL,
                    [Description] nvarchar(2000) NULL,
                    [Category] nvarchar(max) NULL,
                    [Status] nvarchar(20) NOT NULL,
                    [Priority] nvarchar(20) NOT NULL,
                    [DueDate] datetime2 NULL,
                    [CreatedAt] datetime2 NOT NULL,
                    [UpdatedAt] datetime2 NOT NULL,
                    CONSTRAINT [PK_Tasks_old] PRIMARY KEY ([Id])
                );
            ");

            migrationBuilder.Sql(@"
                INSERT INTO [Tasks_old] ([Title], [Description], [Category], [Status], [Priority], [DueDate], [CreatedAt], [UpdatedAt])
                SELECT [Title], [Description], [Category], [Status], [Priority],
                    DATEADD(second, CAST([DueDate] AS bigint), '1970-01-01'),
                    DATEADD(second, CAST([CreatedAt] AS bigint), '1970-01-01'),
                    DATEADD(second, CAST([UpdatedAt] AS bigint), '1970-01-01')
                FROM [Tasks];
            ");

            migrationBuilder.Sql(@"
                DROP TABLE [Tasks];
                EXEC sp_rename 'Tasks_old', 'Tasks';
            ");
        }
    }
}
