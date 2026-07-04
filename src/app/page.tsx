import { startSimulator } from "@/lib/simulator";
import Dashboard from "@/components/Dashboard";

// Start the simulator on the server side
startSimulator();

export default function Page() {
  return <Dashboard />;
}
