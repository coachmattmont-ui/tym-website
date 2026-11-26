/* Client quote math. List prices only. No dealer cost. */
(function (root) {
  var DROP = { dealer: 1, dealerCost: 1, fr: 1, cost: 1, email: 1, phone: 1, address: 1, msrp: 1 };
  function round2(n) { return Math.round(Number(n) * 100) / 100; }
  function money(n) {
    var v = round2(n);
    if (!isFinite(v)) return '';
    var cents = Math.round(v * 100) % 100 !== 0;
    return '$' + v.toLocaleString('en-US', { minimumFractionDigits: cents ? 2 : 0, maximumFractionDigits: 2 });
  }
  function cleanLine(line) {
    var src = line || {};
    var qty = Number(src.qty);
    if (!isFinite(qty) || qty <= 0) qty = 1;
    var tbd = !!src.tbd;
    var unit = tbd ? null : Number(src.unit);
    if (!tbd && !isFinite(unit)) unit = 0;
    var total = tbd ? null : round2(unit * qty);
    return {
      name: String(src.name || 'Item').replace(/[\r\n]+/g, ' ').trim().slice(0, 160) || 'Item',
      qty: qty,
      unit: tbd ? null : round2(unit),
      total: total,
      tbd: tbd
    };
  }
  function section(lines) {
    var out = (lines || []).map(cleanLine);
    var subtotal = 0;
    var tbd = 0;
    out.forEach(function (line) {
      if (line.tbd) tbd += 1;
      else subtotal = round2(subtotal + (line.total || 0));
    });
    return { lines: out, subtotal: subtotal, tbd: tbd };
  }
  function buildQuote(input) {
    var src = input || {};
    var floors = [];
    var tbdCount = 0;
    var total = 0;
    (src.floors || []).forEach(function (floor) {
      var rooms = [];
      (floor.rooms || []).forEach(function (room) {
        var block = section(room.lines);
        if (!block.lines.length) return;
        rooms.push({ name: String(room.name || 'Unassigned').slice(0, 80), lines: block.lines, subtotal: block.subtotal, tbd: block.tbd });
        total = round2(total + block.subtotal);
        tbdCount += block.tbd;
      });
      if (rooms.length) floors.push({ name: String(floor.name || '').slice(0, 80), rooms: rooms });
    });
    var whole = section(src.wholeHome || []);
    total = round2(total + whole.subtotal);
    tbdCount += whole.tbd;
    var quote = {
      projectName: String(src.projectName || 'Project').replace(/[\r\n]+/g, ' ').trim().slice(0, 120) || 'Project',
      control: String(src.control || 'Not selected').slice(0, 40),
      date: String(src.date || '').slice(0, 40),
      floors: floors,
      wholeHome: { lines: whole.lines, subtotal: whole.subtotal, tbd: whole.tbd },
      total: total,
      tbdCount: tbdCount
    };
    Object.keys(DROP).forEach(function (key) { delete quote[key]; });
    return quote;
  }
  root.YTQuote = { buildQuote: buildQuote, money: money };
})(typeof window !== 'undefined' ? window : globalThis);
