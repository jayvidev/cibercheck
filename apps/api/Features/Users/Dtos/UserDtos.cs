using System.ComponentModel.DataAnnotations;

namespace CiberCheck.Features.Users.Dtos
{
    public class UserDto
    {
        public int UserId { get; set; }
        public string FirstName { get; set; } = null!;
        public string LastName { get; set; } = null!;
        public string Email { get; set; } = null!;
        public string Role { get; set; } = null!;
        public string? ProfileImageUrl { get; set; }
    }

    public class CreateUserDto
    {
        [Required]
        [MaxLength(50)]
        public string FirstName { get; set; } = null!;
        [Required]
        [MaxLength(50)]
        public string LastName { get; set; } = null!;
        [Required]
        [EmailAddress]
        public string Email { get; set; } = null!;
        [Required]
        [MaxLength(20)]
        public string Role { get; set; } = null!;
        [Required]
        public string Password { get; set; } = null!;
        [MaxLength(512)]
        public string? ProfileImageUrl { get; set; }
    }

    public class UpdateUserDto
    {
        [MaxLength(50)]
        public string? FirstName { get; set; }
        [MaxLength(50)]
        public string? LastName { get; set; }
        [MaxLength(20)]
        public string? Role { get; set; }
        [MaxLength(512)]
        public string? ProfileImageUrl { get; set; }
    }
}
