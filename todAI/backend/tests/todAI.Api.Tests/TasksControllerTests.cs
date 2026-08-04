using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using todAI.Api.Controllers;
using todAI.Api.Data;
using todAI.Api.DTOs;
using todAI.Api.Models;
using Xunit;

namespace todAI.Api.Tests;

public class TasksControllerTests
{
    private static AppDbContext CreateContext()
    {
        var options = new DbContextOptionsBuilder<AppDbContext>()
            .UseInMemoryDatabase(Guid.NewGuid().ToString())
            .Options;

        return new AppDbContext(options);
    }

    [Fact]
    public async System.Threading.Tasks.Task Create_ShouldStoreUnixTimestampValues()
    {
        await using var context = CreateContext();
        var controller = new TasksController(context);

        var dto = new CreateTask
        {
            Title = "Test task",
            Description = "A description",
            Category = "Work",
            Status = Status.Todo,
            Priority = Priority.High,
            DueDate = 1_700_000_000
        };

        var result = await controller.Create(dto);

        var createdResult = Assert.IsType<CreatedAtActionResult>(result);
        var payload = Assert.IsType<TaskResponse>(createdResult.Value);

        Assert.Equal(dto.DueDate, payload.DueDate);
        Assert.True(payload.CreatedAt > 0);
        Assert.True(payload.UpdatedAt > 0);
        Assert.Equal("Test task", payload.Title);
    }

    [Fact]
    public async System.Threading.Tasks.Task GetAll_ShouldReturnTasksSortedByCreationTime()
    {
        await using var context = CreateContext();
        context.Tasks.AddRange(
            new todAI.Api.Models.Task { Title = "Older", CreatedAt = 100, UpdatedAt = 100 },
            new todAI.Api.Models.Task { Title = "Newer", CreatedAt = 200, UpdatedAt = 200 }
        );
        await context.SaveChangesAsync();

        var controller = new TasksController(context);

        var result = await controller.GetAll();

        var okResult = Assert.IsType<OkObjectResult>(result);
        var payload = Assert.IsAssignableFrom<IEnumerable<TaskResponse>>(okResult.Value);
        var titles = payload.Select(task => task.Title).ToArray();

        Assert.Equal(new[] { "Newer", "Older" }, titles);
    }

    [Fact]
    public async System.Threading.Tasks.Task Update_ShouldChangeDueDateAndUpdatedAt()
    {
        await using var context = CreateContext();
        var original = new todAI.Api.Models.Task
        {
            Title = "Original",
            CreatedAt = 100,
            UpdatedAt = 100,
            DueDate = 1000
        };
        context.Tasks.Add(original);
        await context.SaveChangesAsync();

        var controller = new TasksController(context);
        var dto = new UpdateTask
        {
            Title = "Updated",
            Description = "Updated description",
            Category = "Personal",
            Status = Status.Done,
            Priority = Priority.Low,
            DueDate = 2_000_000_000
        };

        var result = await controller.Update(original.Id, dto);

        Assert.IsType<NoContentResult>(result);

        var updated = await context.Tasks.FindAsync(original.Id);
        Assert.NotNull(updated);
        Assert.Equal(dto.DueDate, updated!.DueDate);
        Assert.Equal("Updated", updated.Title);
        Assert.Equal(Status.Done, updated.Status);
        Assert.True(updated.UpdatedAt > 100);
    }

    [Fact]
    public async System.Threading.Tasks.Task Delete_ShouldRemoveTask()
    {
        await using var context = CreateContext();
        var task = new todAI.Api.Models.Task { Title = "Delete me", CreatedAt = 100, UpdatedAt = 100 };
        context.Tasks.Add(task);
        await context.SaveChangesAsync();

        var controller = new TasksController(context);

        var result = await controller.Delete(task.Id);

        Assert.IsType<NoContentResult>(result);
        Assert.DoesNotContain(context.Tasks, entry => entry.Id == task.Id);
    }
}
