namespace CiberCheck.Features.Otps.Entities
{
    public partial class Otp
    {
        public int OtpId { get; set; }
        public string Email { get; set; }
        public string Codigo { get; set; }
        public DateTime FechaCreacion { get; set; }
        public DateTime FechaExpiracion { get; set; }
        public bool Usado { get; set; }
    }

}
