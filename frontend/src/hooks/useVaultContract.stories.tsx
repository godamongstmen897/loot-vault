"use client";

import { useState } from "react";

import { useVaultContract } from "./useVaultContract";

function VaultContractHookStory() {
  const [currentYield, setCurrentYield] = useState<string>("not loaded");
  const [lastWinner, setLastWinner] = useState<string>("not loaded");
  const { methods, loading, error, isConnected } = useVaultContract();

  return (
    <section
      style={{
        background: "#070707",
        color: "#f8fafc",
        display: "grid",
        gap: 16,
        maxWidth: 520,
        padding: 24,
      }}
    >
      <header>
        <h2 style={{ fontSize: 22, fontWeight: 700, margin: 0 }}>Loot Vault Hook</h2>
        <p style={{ color: "#94a3b8", margin: "8px 0 0" }}>
          {isConnected ? "connected" : "disconnected"}
          {loading ? " / loading" : ""}
        </p>
      </header>

      <dl style={{ display: "grid", gap: 8, margin: 0 }}>
        <div>
          <dt style={{ color: "#67e8f9", fontSize: 12, textTransform: "uppercase" }}>
            Current yield
          </dt>
          <dd style={{ margin: 0 }}>{currentYield}</dd>
        </div>
        <div>
          <dt style={{ color: "#67e8f9", fontSize: 12, textTransform: "uppercase" }}>
            Last winner
          </dt>
          <dd style={{ margin: 0 }}>{lastWinner}</dd>
        </div>
      </dl>

      {error ? <p style={{ color: "#fca5a5", margin: 0 }}>{error.message}</p> : null}

      <div style={{ display: "flex", gap: 8 }}>
        <button
          disabled={loading}
          onClick={() => {
            void methods
              .getCurrentYield()
              .then((value) => setCurrentYield(value.toString()))
              .catch((caughtError: Error) => setCurrentYield(caughtError.message));
          }}
          style={{ padding: "8px 12px" }}
          type="button"
        >
          Read yield
        </button>
        <button
          disabled={loading}
          onClick={() => {
            void methods
              .getLastWinner()
              .then((value) => setLastWinner(value ?? "none"))
              .catch((caughtError: Error) => setLastWinner(caughtError.message));
          }}
          style={{ padding: "8px 12px" }}
          type="button"
        >
          Read winner
        </button>
      </div>
    </section>
  );
}

const meta = {
  title: "Hooks/useVaultContract",
  component: VaultContractHookStory,
};

export default meta;

export const Default = {};
