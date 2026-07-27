const MAX_RECORDS = 500;

export class TelemetryStore {
  #records = [];

  add(record) {
    this.#records.push(record);
    if (this.#records.length > MAX_RECORDS) {
      this.#records.splice(0, this.#records.length - MAX_RECORDS);
    }
    return record;
  }

  addMany(records) {
    return records.map((record) => this.add(record));
  }

  all() {
    return [...this.#records];
  }

  clear() {
    this.#records = [];
  }
}
