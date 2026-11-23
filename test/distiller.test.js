import test from 'node:test';
import assert from 'node:assert/strict';
import { extractSymbols, estimateTokens } from '../src/distiller/symbolExtractor.js';

test('estimateTokens calculates approximate token count based on length', () => {
  const sample = 'const a = 10; function test() { return a * 2; }';
  const tokens = estimateTokens(sample);
  assert.ok(tokens > 5 && tokens < 25);
  assert.equal(estimateTokens(''), 0);
});

test('extractSymbols retains short code without stripping', () => {
  const shortCode = 'export function add(a, b) {\n  return a + b;\n}';
  const result = extractSymbols(shortCode, 'src/math.js');
  assert.ok(result.includes('export function add(a, b)'));
  assert.ok(result.includes('return a + b;'));
});

test('extractSymbols pinpoints targeted function symbol', () => {
  const code = `
function ignoredOne() {
  return 1;
}

export function targetHandler(req, res) {
  const data = req.body;
  return res.json({ success: true, data });
}

function ignoredTwo() {
  return 2;
}
`;
  const result = extractSymbols(code, 'src/api.js', { targetSymbol: 'targetHandler' });
  assert.ok(result.includes('targetHandler(req, res)'));
  assert.equal(result.includes('ignoredOne'), false);
});

test('extractSymbols outlines C# classes, records, and controller actions with attributes', () => {
  const csharpCode = `using Microsoft.AspNetCore.Mvc;
namespace Backend.Controllers;

[ApiController]
[Route("api/[controller]")]
public class OrdersController : ControllerBase
{
    [HttpGet("{id}")]
    public async Task<IActionResult> GetOrder(int id, CancellationToken ct)
    {
        var order = await _service.FindByIdAsync(id, ct);
        if (order == null) return NotFound();
        return Ok(order);
    }
}
public record OrderDto(int Id, string Customer);
`;
  const result = extractSymbols(csharpCode, 'Controllers/OrdersController.cs', { maxLines: 20 });
  assert.ok(result.includes('using Microsoft.AspNetCore.Mvc;'));
  assert.ok(result.includes('namespace Backend.Controllers;'));
  assert.ok(result.includes('[ApiController]'));
  assert.ok(result.includes('public class OrdersController'));
});
