using Microsoft.EntityFrameworkCore;
using todAI.Api.Models;

namespace todAI.Api.Data;

public class AppDbContext(DbContextOptions<AppDbContext> options) : DbContext(options)
{
    public DbSet<Models.Task> Tasks { get; set; }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<Models.Task>(entity =>
        {
            entity.HasKey(t => t.Id);
            entity.Property(t => t.Title).IsRequired().HasMaxLength(200);
            entity.Property(t => t.Description).HasMaxLength(2000);
            entity.Property(t => t.Status)
                  .HasConversion<string>()
                  .HasMaxLength(20);
            entity.Property(t => t.Priority)
                  .HasConversion<string>()
                  .HasMaxLength(20);
            entity.Property(t => t.DueDate).HasColumnType("bigint");
            entity.Property(t => t.CreatedAt).HasColumnType("bigint");
            entity.Property(t => t.UpdatedAt).HasColumnType("bigint");
        });
    }
}
