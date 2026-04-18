FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src

COPY . .

RUN dotnet restore "CiberCheck.csproj" --force
RUN dotnet publish "CiberCheck.csproj" -c Release -o /app

FROM mcr.microsoft.com/dotnet/aspnet:8.0
WORKDIR /app
COPY --from=build /app .
EXPOSE 7204
ENV ASPNETCORE_URLS=http://+:$PORT
CMD ["dotnet", "CiberCheck.dll"]