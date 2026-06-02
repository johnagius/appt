/** Tiny in-memory D1-shaped stub supporting the subset of SQL the reservation
 *  flow uses: INSERT by column list, SELECT * WHERE <col> = ?, and UPDATE with
 *  mixed placeholder/literal SET clauses (e.g. status = 'READY_FOR_COLLECTION').
 *  Modeled on test/telemedicine-flow.test.ts in the appointment app. */
export class FakeDB {
  tables: Record<string, any[]> = {};

  prepare(sql: string) {
    const self = this;
    return {
      _sql: sql,
      _binds: [] as any[],
      bind(...args: any[]) { this._binds = args; return this; },
      async run() { return self._run(this._sql, this._binds); },
      async first() { return self._select(this._sql, this._binds)[0] || null; },
      async all() { return { results: self._select(this._sql, this._binds) }; },
    };
  }

  _norm(sql: string): string { return sql.toLowerCase().replace(/\s+/g, ' ').trim(); }

  _run(sql: string, binds: any[]) {
    const low = this._norm(sql);
    if (low.startsWith('insert into')) {
      const tbl = low.match(/insert(?: or \w+)? into (\w+)/)![1];
      const colsM = sql.match(/\(([^)]+)\)\s*values/i);
      this.tables[tbl] = this.tables[tbl] || [];
      if (colsM) {
        const cols = colsM[1].split(',').map(s => s.trim());
        const row: any = {};
        for (let i = 0; i < cols.length; i++) row[cols[i]] = binds[i];
        this.tables[tbl].push(row);
      }
      return { meta: { changes: 1 } };
    }
    if (low.startsWith('update')) {
      const tbl = low.match(/update (\w+)/)![1];
      const id = binds[binds.length - 1];
      const rows = (this.tables[tbl] || []).filter(r => r.id === id);
      const setM = sql.match(/set\s+([^]+?)\s+where/i);
      if (setM) {
        const assigns = setM[1].split(',').map(s => s.trim());
        let bi = 0;
        for (const a of assigns) {
          const [colRaw, rhsRaw] = a.split('=');
          const col = colRaw.trim();
          const rhs = rhsRaw.trim();
          let val: any;
          if (rhs === '?') { val = binds[bi++]; }
          else { val = rhs.replace(/^'(.*)'$/, '$1'); }
          for (const r of rows) r[col] = val;
        }
      }
      return { meta: { changes: rows.length } };
    }
    if (low.startsWith('delete from')) {
      const tbl = low.match(/delete from (\w+)/)![1];
      const before = (this.tables[tbl] || []).length;
      this.tables[tbl] = (this.tables[tbl] || []).filter(r => r.id !== binds[0]);
      return { meta: { changes: before - this.tables[tbl].length } };
    }
    return { meta: { changes: 0 } };
  }

  _select(sql: string, binds: any[]): any[] {
    const low = this._norm(sql);
    const tblM = low.match(/from (\w+)/);
    if (!tblM) return [];
    const tbl = tblM[1];
    let rows = (this.tables[tbl] || []).slice();
    const whereM = low.match(/where (\w+) = \?/);
    if (whereM) {
      const col = whereM[1];
      rows = rows.filter(r => r[col] === binds[0]);
    }
    const orderM = low.match(/order by (\w+)( desc)?/);
    if (orderM) {
      const col = orderM[1];
      const desc = !!orderM[2];
      rows.sort((a, b) => String(a[col] ?? '').localeCompare(String(b[col] ?? '')));
      if (desc) rows.reverse();
    }
    return rows;
  }
}
