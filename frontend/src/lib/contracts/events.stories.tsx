"use client";

import { useEffect, useState } from "react";
import {
  DEFAULT_CONTRACT_EVENT_TYPES,
  type ContractEvent,
  subscribeToContractEvents,
} from "./events";

function stringifyEventData(data: unknown) {
  return JSON.stringify(
    data,
    (_key, value) => (typeof value === "bigint" ? value.toString() : value),
    2,
  );
}

export function ContractEventListenerExample() {
  const [events, setEvents] = useState<ContractEvent[]>([]);

  useEffect(() => {
    const stopListening = subscribeToContractEvents(
      [...DEFAULT_CONTRACT_EVENT_TYPES],
      (event) => {
        setEvents((currentEvents) => [event, ...currentEvents].slice(0, 5));
      },
    );

    return stopListening;
  }, []);

  return (
    <section
      style={{
        background: "#0b1020",
        border: "1px solid #22304f",
        borderRadius: 8,
        color: "#e5f0ff",
        display: "grid",
        gap: 16,
        maxWidth: 720,
        padding: 24,
      }}
    >
      <header>
        <h2 style={{ fontSize: 20, margin: 0 }}>Contract events</h2>
        <p style={{ color: "#9fb4d3", margin: "8px 0 0" }}>
          Listening for YieldClaimed, JobCompleted, and DisputeRaised events.
        </p>
      </header>

      <div style={{ display: "grid", gap: 12 }}>
        {events.length === 0 ? (
          <p style={{ color: "#9fb4d3", margin: 0 }}>
            Waiting for matching contract events...
          </p>
        ) : (
          events.map((event) => (
            <article
              key={event.id}
              style={{
                background: "#111a2e",
                border: "1px solid #26395f",
                borderRadius: 6,
                padding: 16,
              }}
            >
              <strong>{event.eventType}</strong>
              <div style={{ color: "#9fb4d3", fontSize: 13, marginTop: 4 }}>
                {event.contract} · ledger {event.ledger}
              </div>
              <pre
                style={{
                  background: "#070b14",
                  borderRadius: 6,
                  color: "#d8e7ff",
                  margin: "12px 0 0",
                  overflowX: "auto",
                  padding: 12,
                }}
              >
                {stringifyEventData(event.data)}
              </pre>
            </article>
          ))
        )}
      </div>
    </section>
  );
}

const meta = {
  title: "Contracts/ContractEventListener",
  component: ContractEventListenerExample,
};

export default meta;

export const Default = {};
