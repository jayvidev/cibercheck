using System.Globalization;
using System.Text;
using System.Text.RegularExpressions;

namespace CiberCheck.Features.Common.Helpers;

public static class SlugGenerator
{
    /// <summary>
    /// Genera un slug URL-friendly desde un texto
    /// </summary>
    /// <param name="text">Texto a convertir en slug</param>
    /// <returns>Slug normalizado (ejemplo: "introduccion-a-la-programacion")</returns>
    public static string GenerateSlug(string text)
    {
        if (string.IsNullOrWhiteSpace(text))
            return string.Empty;

        // Normalizar a minúsculas
        var slug = text.ToLowerInvariant();

        // Remover acentos
        slug = RemoveDiacritics(slug);

        // Reemplazar caracteres especiales comunes
        slug = slug
            .Replace("ñ", "n")
            .Replace("ü", "u");

        // Reemplazar espacios y guiones bajos por guiones
        slug = Regex.Replace(slug, @"[\s_]+", "-");

        // Remover caracteres no alfanuméricos (excepto guiones)
        slug = Regex.Replace(slug, @"[^a-z0-9\-]", "");

        // Remover guiones múltiples
        slug = Regex.Replace(slug, @"-{2,}", "-");

        // Remover guiones al inicio y final
        slug = slug.Trim('-');

        return slug;
    }

    /// <summary>
    /// Remueve acentos diacríticos de caracteres
    /// </summary>
    private static string RemoveDiacritics(string text)
    {
        var normalizedString = text.Normalize(NormalizationForm.FormD);
        var stringBuilder = new StringBuilder();

        foreach (var c in normalizedString)
        {
            var unicodeCategory = CharUnicodeInfo.GetUnicodeCategory(c);
            if (unicodeCategory != UnicodeCategory.NonSpacingMark)
            {
                stringBuilder.Append(c);
            }
        }

        return stringBuilder.ToString().Normalize(NormalizationForm.FormC);
    }

    /// <summary>
    /// Genera un slug único añadiendo un sufijo numérico si es necesario
    /// </summary>
    /// <param name="baseText">Texto base</param>
    /// <param name="existingSlugs">Lista de slugs existentes</param>
    /// <returns>Slug único</returns>
    public static string GenerateUniqueSlug(string baseText, IEnumerable<string> existingSlugs)
    {
        var slug = GenerateSlug(baseText);
        var originalSlug = slug;
        var counter = 1;

        var existingSet = new HashSet<string>(existingSlugs, StringComparer.OrdinalIgnoreCase);

        while (existingSet.Contains(slug))
        {
            slug = $"{originalSlug}-{counter}";
            counter++;
        }

        return slug;
    }
}
