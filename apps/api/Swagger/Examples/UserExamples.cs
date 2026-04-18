using System.Collections.Generic;
using CiberCheck.Features.Users.Dtos;
using Swashbuckle.AspNetCore.Filters;

namespace CiberCheck.Swagger.Examples
{
    public class CreateUserDtoExample : IExamplesProvider<CreateUserDto>
    {
        public CreateUserDto GetExamples() => new()
        {
            FirstName = "Juan",
            LastName = "Pérez",
            Email = "jperez@cibertec.edu.pe",
            Role = "profesor",
            Password = "profe123"
        };
    }

    public class UpdateUserDtoExample : IExamplesProvider<UpdateUserDto>
    {
        public UpdateUserDto GetExamples() => new()
        {
            FirstName = "Juan",
            LastName = "Pérez Actualizado",
            Role = "profesor"
        };
    }

    public class UserDtoExample : IExamplesProvider<UserDto>
    {
        public UserDto GetExamples() => new()
        {
            UserId = 1,
            FirstName = "Juan",
            LastName = "Pérez",
            Email = "jperez@cibertec.edu.pe",
            Role = "profesor"
        };
    }

    public class UserDtoListExample : IExamplesProvider<IEnumerable<UserDto>>
    {
        public IEnumerable<UserDto> GetExamples() => new List<UserDto>
        {
            new() { UserId = 1, FirstName = "Juan", LastName = "Pérez", Email = "jperez@cibertec.edu.pe", Role = "profesor" },
            new() { UserId = 5, FirstName = "Ana", LastName = "López", Email = "i202507323@cibertec.edu.pe", Role = "estudiante" }
        };
    }
}
