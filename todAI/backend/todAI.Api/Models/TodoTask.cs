namespace todAI.Api.Models;

public enum Status
{
    Todo,
    InProgress,
    Done
}

public enum Priority
{
    Low,
    Medium,
    High
}

public class Task
{
    public int Id { get; set; }
    public string Title { get; set; } = string.Empty;
    public string? Description { get; set; }
    public string? Category { get; set; }
    public Status Status { get; set; } = Status.Todo;
    public Priority Priority { get; set; } = Priority.Medium;
    public DateTime? DueDate { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
}
