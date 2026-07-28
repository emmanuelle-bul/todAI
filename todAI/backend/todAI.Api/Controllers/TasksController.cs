using Microsoft.AspNetCore.Mvc;
using todAI.Api.DTOs;

namespace todAI.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class TasksController : ControllerBase
{
    // GET api/tasks
    [HttpGet]
    public IActionResult GetAll()
    {
        return StatusCode(StatusCodes.Status501NotImplemented);
    }

    // GET api/tasks/{id}
    [HttpGet("{id:int}")]
    public IActionResult GetById(int id)
    {
        return StatusCode(StatusCodes.Status501NotImplemented);
    }

    // POST api/tasks
    [HttpPost]
    public IActionResult Create([FromBody] CreateTaskDto dto)
    {
        return StatusCode(StatusCodes.Status501NotImplemented);
    }

    // PUT api/tasks/{id}
    [HttpPut("{id:int}")]
    public IActionResult Update(int id, [FromBody] UpdateTaskDto dto)
    {
        return StatusCode(StatusCodes.Status501NotImplemented);
    }

    // DELETE api/tasks/{id}
    [HttpDelete("{id:int}")]
    public IActionResult Delete(int id)
    {
        return StatusCode(StatusCodes.Status501NotImplemented);
    }
}
