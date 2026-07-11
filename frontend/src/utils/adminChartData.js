const SOURCE_LABELS = {
  subscription: 'Subscriptions',
  inspection: 'Viewing fees',
  airbnb_fees: 'Airbnb fees',
};

/** Last N days of platform revenue from transaction timestamps. */
export function buildTransactionSparkline(transactions = [], days = 14) {
  const buckets = Array.from({ length: days }, (_, i) => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    d.setDate(d.getDate() - (days - 1 - i));
    return {
      key: d.toISOString().slice(0, 10),
      label: d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
      value: 0,
    };
  });

  const bucketMap = Object.fromEntries(buckets.map((b) => [b.key, b]));

  transactions.forEach((tx) => {
    const raw = tx.completed_at || tx.date;
    if (!raw) return;
    const key = new Date(raw).toISOString().slice(0, 10);
    if (bucketMap[key]) {
      bucketMap[key].value += Number(tx.amount) || 0;
    }
  });

  return buckets;
}

export function buildSourceBarData(bySource = {}) {
  return Object.entries(bySource)
    .filter(([, value]) => Number(value) > 0)
    .map(([key, value]) => ({
      name: SOURCE_LABELS[key] || key.replace(/_/g, ' '),
      value: Number(value) || 0,
    }));
}

export function buildOwnerPieData(owners = [], limit = 5) {
  return owners.slice(0, limit).map((owner) => ({
    name: owner.ownerName || owner.name || 'Owner',
    value: Number(owner.revenue) || 0,
  }));
}

export function buildOccupancyBarData(properties = [], limit = 6) {
  return properties.slice(0, limit).map((property) => ({
    name: property.name?.length > 18 ? `${property.name.slice(0, 16)}…` : property.name,
    occupancy: Number(property.occupancy) || 0,
  }));
}
