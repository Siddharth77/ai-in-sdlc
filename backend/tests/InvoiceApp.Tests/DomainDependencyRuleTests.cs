using System.Reflection;
using InvoiceApp.Domain;
using Xunit;

namespace InvoiceApp.Tests;

/// <summary>
/// Architecture rule: the Domain assembly must not depend on the Api project, web, storage, HTTP or messaging
/// assemblies. Those belong in InvoiceApp.Api behind interfaces such as IInvoiceRepository (see AGENTS.md).
///
/// The rule inspects the compiled InvoiceApp.Domain assembly, not source text. Only assemblies the compiled code
/// actually uses appear in its reference list, so this reports real dependencies.
///
/// Run:  dotnet test backend/InvoiceApp.sln --filter "FullyQualifiedName~DomainDependencyRuleTests"
/// </summary>
public class DomainDependencyRuleTests
{
    private static readonly string[] ForbiddenAssemblyPrefixes =
    {
        "InvoiceApp.Api",
        "Microsoft.AspNetCore",
        "Microsoft.EntityFrameworkCore",
        "Microsoft.Data",
        "System.Data",
        "System.Net.Http",
        "Azure.",
    };

    private static IReadOnlyList<string> ForbiddenReferences(Assembly assembly, IEnumerable<string> forbiddenPrefixes) =>
        assembly.GetReferencedAssemblies()
            .Select(reference => reference.Name ?? string.Empty)
            .Where(name => forbiddenPrefixes.Any(prefix => name.StartsWith(prefix, StringComparison.Ordinal)))
            .OrderBy(name => name, StringComparer.Ordinal)
            .ToList();

    [Fact]
    public void Domain_DoesNotReferenceApiWebStorageHttpOrMessagingAssemblies()
    {
        var domainAssembly = typeof(ApprovalService).Assembly;
        Assert.Equal("InvoiceApp.Domain", domainAssembly.GetName().Name);

        var violations = ForbiddenReferences(domainAssembly, ForbiddenAssemblyPrefixes);

        Assert.True(
            violations.Count == 0,
            $"InvoiceApp.Domain must not depend on: {string.Join(", ", violations)}. " +
            "Move that code to InvoiceApp.Api behind an interface declared in Domain.");
    }

    [Fact]
    public void RuleCheck_ReportsAnAssemblyThatReferencesAForbiddenPrefix()
    {
        // Negative control: proves the check can fail. This test assembly really does reference InvoiceApp.Domain.
        var violations = ForbiddenReferences(typeof(DomainDependencyRuleTests).Assembly, new[] { "InvoiceApp.Domain" });

        Assert.Contains("InvoiceApp.Domain", violations);
    }
}
