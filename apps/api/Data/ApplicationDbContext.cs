using System;
using System.Collections.Generic;
using CiberCheck.Features.Attendance.Entities;
using CiberCheck.Features.Courses.Entities;
using CiberCheck.Features.Otps.Entities;
using CiberCheck.Features.Sections.Entities;
using CiberCheck.Features.Sessions.Entities;
using CiberCheck.Features.Users.Entities;
using Microsoft.EntityFrameworkCore;

namespace CiberCheck.Data;

public partial class ApplicationDbContext : DbContext
{
    public ApplicationDbContext()
    {
    }

    public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options)
        : base(options)
    {
    }

    public virtual DbSet<Attendance> Attendances { get; set; }

    public virtual DbSet<SessionQrToken> SessionQrTokens { get; set; }

    public virtual DbSet<Course> Courses { get; set; }
    public virtual DbSet<Otp> Otp { get; set; }

    public virtual DbSet<Section> Sections { get; set; }

    public virtual DbSet<Session> Sessions { get; set; }

    public virtual DbSet<User> Users { get; set; }

    protected override void OnConfiguring(DbContextOptionsBuilder optionsBuilder)
    {
        if (!optionsBuilder.IsConfigured)
        {
            // fallback (mejor desde env vars, no hardcode)
            optionsBuilder.UseSqlServer(Environment.GetEnvironmentVariable("DefaultConnection"));
        }
    }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<Attendance>(entity =>
        {
            entity.HasKey(e => new { e.StudentId, e.SessionId }).HasName("PK__Attendan__2E5A62B0AF1F7474");

            entity.ToTable("Attendance");

            entity.Property(e => e.Status).HasMaxLength(20);

            entity.HasOne(d => d.Session).WithMany(p => p.Attendances)
                .HasForeignKey(d => d.SessionId)
                .HasConstraintName("FK__Attendanc__Sessi__03F0984C");

            entity.HasOne(d => d.Student).WithMany(p => p.Attendances)
                .HasForeignKey(d => d.StudentId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK__Attendanc__Stude__02FC7413");
        });

        modelBuilder.Entity<SessionQrToken>(entity =>
        {
            entity.HasKey(e => e.SessionQrTokenId).HasName("PK__SessionQr__6E3E2B8A123456789");

            entity.ToTable("SessionQrTokens");

            entity.Property(e => e.Token)
                .HasMaxLength(16)
                .IsRequired();

            entity.Property(e => e.CreatedAt)
                .HasDefaultValueSql("GETUTCDATE()");

            entity.HasOne(d => d.Session).WithMany(p => p.QrTokens)
                .HasForeignKey(d => d.SessionId)
                .HasConstraintName("FK__SessionQr__Sessi__ABC123DE");
        });


        modelBuilder.Entity<Course>(entity =>
        {
            entity.HasKey(e => e.CourseId).HasName("PK__Courses__C92D71A7094B046F");

            entity.HasIndex(e => e.Code, "UQ__Courses__A25C5AA78F5784E3").IsUnique();

            entity.Property(e => e.Code).HasMaxLength(20);
            entity.Property(e => e.Name).HasMaxLength(100);
        });

        modelBuilder.Entity<Otp>(entity =>
        {
            entity.HasKey(e => e.OtpId).HasName("PK__Otp__C8B1232A12345678");
            entity.ToTable("Otp");

            entity.Property(e => e.Email)
                .HasMaxLength(100)
                .IsRequired();

            entity.Property(e => e.Codigo)
                .HasMaxLength(6)
                .IsRequired();

            entity.Property(e => e.FechaCreacion)
                .HasDefaultValueSql("GETDATE()");

            entity.Property(e => e.Usado)
                .HasDefaultValue(false);
        });



        modelBuilder.Entity<Section>(entity =>
        {
            entity.HasKey(e => e.SectionId).HasName("PK__Sections__80EF08722702C3BE");

            entity.Property(e => e.Name).HasMaxLength(50);

            entity.HasOne(d => d.Course).WithMany(p => p.Sections)
                .HasForeignKey(d => d.CourseId)
                .HasConstraintName("FK__Sections__Course__778AC167");

            entity.HasOne(d => d.Teacher).WithMany(p => p.Sections)
                .HasForeignKey(d => d.TeacherId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK__Sections__Teache__787EE5A0");
        });

        modelBuilder.Entity<Session>(entity =>
        {
            entity.HasKey(e => e.SessionId).HasName("PK__Sessions__C9F49290C1011A36");

            entity.Property(e => e.Topic).HasMaxLength(200);

            entity.HasOne(d => d.Section).WithMany(p => p.Sessions)
                .HasForeignKey(d => d.SectionId)
                .HasConstraintName("FK__Sessions__Sectio__7F2BE32F");
        });

        modelBuilder.Entity<User>(entity =>
        {
            entity.HasKey(e => e.UserId).HasName("PK__Users__1788CC4CDD2D76CD");

            entity.HasIndex(e => e.Email, "UQ__Users__A9D10534495E3036").IsUnique();

            entity.Property(e => e.FirstName).HasMaxLength(50);
            entity.Property(e => e.LastName).HasMaxLength(50);
            entity.Property(e => e.Email).HasMaxLength(100);
            entity.Property(e => e.PasswordHash).HasMaxLength(255);
            entity.Property(e => e.Role).HasMaxLength(20);

            entity.HasMany(d => d.SectionsNavigation).WithMany(p => p.Students)
                .UsingEntity<Dictionary<string, object>>(
                    "StudentsSection",
                    r => r.HasOne<Section>().WithMany()
                        .HasForeignKey("SectionId")
                        .HasConstraintName("FK__StudentsS__Secti__7C4F7684"),
                    l => l.HasOne<User>().WithMany()
                        .HasForeignKey("StudentId")
                        .OnDelete(DeleteBehavior.ClientSetNull)
                        .HasConstraintName("FK__StudentsS__Stude__7B5B524B"),
                    j =>
                    {
                        j.HasKey("StudentId", "SectionId").HasName("PK__Students__0ACBDB1EA7C16138");
                        j.ToTable("StudentsSections");
                    });
        });


        OnModelCreatingPartial(modelBuilder);
    }

    partial void OnModelCreatingPartial(ModelBuilder modelBuilder);
}
