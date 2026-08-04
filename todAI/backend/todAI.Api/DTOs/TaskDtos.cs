using todAI.Api.Models;
using System.ComponentModel.DataAnnotations;

namespace todAI.Api.DTOs;

public class CreateTask
{
    [Required]
    [MaxLength(200)]
    public string Title { get; set; } = string.Empty;

    [MaxLength(2000)]
    public string? Description { get; set; }
    public string? Category { get; set; }
    public Status Status { get; set; } = Status.Todo;
    public Priority Priority { get; set; } = Priority.Medium;
    public long? DueDate { get; set; }
}

public class UpdateTask
{
    [Required]
    [MaxLength(200)]
    public string Title { get; set; } = string.Empty;

    [MaxLength(2000)]
    public string? Description { get; set; }
    public string? Category { get; set; }
    public Status Status { get; set; }
    public Priority Priority { get; set; }
    public long? DueDate { get; set; }
}

public class TaskResponse
{
    public int Id { get; set; }
    public string Title { get; set; } = string.Empty;
    public string? Description { get; set; }
    public string? Category { get; set; }
    public string Status { get; set; } = string.Empty;
    public string Priority { get; set; } = string.Empty;
    public long? DueDate { get; set; }
    public long CreatedAt { get; set; }
    public long UpdatedAt { get; set; }
}
