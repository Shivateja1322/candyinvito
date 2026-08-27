import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { supabase } from "../lib/supabase";
import { Button } from "../components/ui/button";
import { toast } from "sonner";
import { Monogram } from "../components/site/Monogram";

export const Route = createFileRoute("/setup")({
  component: SetupDatabase,
});

function SetupDatabase() {
  const [isSeeding, setIsSeeding] = useState(false);
  const [logs, setLogs] = useState<string[]>([]);

  const addLog = (msg: string) => setLogs((prev) => [...prev, msg]);

  const handleSetup = async () => {
    setIsSeeding(true);
    setLogs([]);
    try {
      addLog("Starting database seed process...");

      // 1. Create Admin
      addLog("Creating admin user (admin@candyinvito.com)...");
      const { data: adminData, error: adminErr } = await supabase.auth.signUp({
        email: "admin@candyinvito.com",
        password: "Admin@1322",
      });

      if (adminErr) {
        addLog(`Admin Auth Error (might already exist): ${adminErr.message}`);
      } else if (adminData.user) {
        addLog(`Admin Auth Created. ID: ${adminData.user.id}`);
        // Insert into public.users
        const { error: insertErr } = await supabase.from("users").insert({
          id: adminData.user.id,
          email: "admin@candyinvito.com",
          role: "ADMIN",
          name: "Platform Admin",
        });
        if (insertErr) addLog(`Admin Insert Error (might already exist): ${insertErr.message}`);
        else addLog("Admin role saved to public.users!");
      }

      // 2. Create Sample Client
      addLog("Creating sample client user (client@candyinvito.com)...");
      const { data: clientData, error: clientErr } = await supabase.auth.signUp({
        email: "client@candyinvito.com",
        password: "Client@1322",
      });

      if (clientErr) {
        addLog(`Client Auth Error (might already exist): ${clientErr.message}`);
      } else if (clientData.user) {
        addLog(`Client Auth Created. ID: ${clientData.user.id}`);
        // Insert into public.users
        const { error: insertErr } = await supabase.from("users").insert({
          id: clientData.user.id,
          email: "client@candyinvito.com",
          role: "CLIENT",
          name: "Sample Client",
        });
        if (insertErr) addLog(`Client Insert Error (might already exist): ${insertErr.message}`);
        else addLog("Client role saved to public.users!");
      }

      addLog("Seed process complete! You can now log in at /login.");
      toast.success("Database seeded!");
    } catch (err: any) {
      addLog(`Unexpected Error: ${err.message}`);
    } finally {
      setIsSeeding(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4 py-12">
      <div className="absolute top-8 left-8">
        <Monogram />
      </div>
      <div className="max-w-2xl w-full border border-border p-8 bg-card shadow-sm">
        <h1 className="text-2xl font-display font-medium mb-4">Database Seeder</h1>
        <p className="text-sm text-muted-foreground mb-8">
          This utility creates the `admin@candyinvito.com` and a sample `client@candyinvito.com` in
          your Supabase project. Make sure you have run the `schema.sql` in your Supabase SQL editor
          before clicking this button!
        </p>

        <Button onClick={handleSetup} disabled={isSeeding} className="w-full mb-8">
          {isSeeding ? "Seeding database..." : "Run Seed Script"}
        </Button>

        {logs.length > 0 && (
          <div className="bg-secondary/50 p-4 font-mono text-xs text-muted-foreground h-48 overflow-y-auto rounded-md">
            {logs.map((log, i) => (
              <div key={i} className="mb-1">
                {">"} {log}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
