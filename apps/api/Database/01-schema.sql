CREATE DATABASE CiberCheck;
GO

USE CiberCheck;
GO

CREATE TABLE Users (
    UserId INT IDENTITY(1,1) PRIMARY KEY,
    FirstName NVARCHAR(50) NOT NULL,
    LastName NVARCHAR(50) NOT NULL,
    Email NVARCHAR(100) NOT NULL UNIQUE,
    Role NVARCHAR(20) NOT NULL CHECK (Role IN ('profesor', 'estudiante','administrador')),
    PasswordHash NVARCHAR(255) NOT NULL,
    ProfileImageUrl NVARCHAR(512) NULL
);
GO

CREATE TABLE OTP (
    OtpId INT IDENTITY(1,1) PRIMARY KEY,
    Email NVARCHAR(100) NOT NULL,
    Codigo NVARCHAR(6) NOT NULL,
    FechaCreacion DATETIME DEFAULT GETDATE(),
    FechaExpiracion DATETIME NOT NULL,
    Usado BIT DEFAULT 0
);
GO


CREATE TABLE Courses (
    CourseId INT IDENTITY(1,1) PRIMARY KEY,
    Name NVARCHAR(100) NOT NULL,
    Code NVARCHAR(20) NOT NULL UNIQUE,
    Slug NVARCHAR(100) NOT NULL UNIQUE,
    Color NVARCHAR(7) NOT NULL
);
GO

CREATE TABLE Sections (
    SectionId INT IDENTITY(1,1) PRIMARY KEY,
    CourseId INT NOT NULL,
    TeacherId INT NOT NULL,
    Name NVARCHAR(50) NOT NULL UNIQUE,
    Slug NVARCHAR(100) NOT NULL,
    IsVirtual BIT NOT NULL DEFAULT 0,
    CONSTRAINT UQ_Section_Course_Slug UNIQUE (CourseId, Slug),
    FOREIGN KEY (CourseId) REFERENCES Courses(CourseId) ON DELETE CASCADE,
    FOREIGN KEY (TeacherId) REFERENCES Users(UserId) ON DELETE NO ACTION
);
GO

CREATE TABLE StudentsSections (
    StudentId INT NOT NULL,
    SectionId INT NOT NULL,
    PRIMARY KEY (StudentId, SectionId),
    FOREIGN KEY (StudentId) REFERENCES Users(UserId) ON DELETE NO ACTION,
    FOREIGN KEY (SectionId) REFERENCES Sections(SectionId) ON DELETE CASCADE
);
GO

CREATE TABLE Sessions (
    SessionId INT IDENTITY(1,1) PRIMARY KEY,
    SectionId INT NOT NULL,
    SessionNumber INT NOT NULL,
    Date DATE NOT NULL,
    StartTime TIME,
    EndTime TIME,
    Topic NVARCHAR(200),
    FOREIGN KEY (SectionId) REFERENCES Sections(SectionId) ON DELETE CASCADE
);
GO

CREATE TABLE Attendance (
    StudentId INT NOT NULL,
    SessionId INT NOT NULL,
    Status NVARCHAR(20) NOT NULL DEFAULT 'no_registrado' CHECK (Status IN ('presente','ausente','tarde','justificado','no_registrado')),
    Notes NVARCHAR(MAX),
    CreatedAt DATETIME2 DEFAULT GETUTCDATE(),
    PRIMARY KEY (StudentId, SessionId),
    FOREIGN KEY (StudentId) REFERENCES Users(UserId) ON DELETE NO ACTION,
    FOREIGN KEY (SessionId) REFERENCES Sessions(SessionId) ON DELETE CASCADE
);
GO

CREATE TABLE SessionQrTokens (
    SessionQrTokenId INT IDENTITY(1,1) PRIMARY KEY,
    SessionId INT NOT NULL,
    Token NVARCHAR(16) NOT NULL UNIQUE,
    CreatedAt DATETIME2 DEFAULT GETUTCDATE(),
    ExpiresAt DATETIME2 NOT NULL,
    FOREIGN KEY (SessionId) REFERENCES Sessions(SessionId) ON DELETE CASCADE
);
GO

CREATE INDEX IX_SessionQrTokens_Token ON SessionQrTokens(Token);
CREATE INDEX IX_SessionQrTokens_SessionId ON SessionQrTokens(SessionId);
CREATE INDEX IX_SessionQrTokens_ExpiresAt ON SessionQrTokens(ExpiresAt);
GO



