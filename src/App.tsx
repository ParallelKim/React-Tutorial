import { Route, Routes } from "react-router-dom";
import { BELabs } from "./pages/BE-Labs";
import { EmailLogin } from "./pages/EmailLogin";
import { WorkflowLabs } from "./pages/Workflow-Labs";
import { SignFinishPage } from "./pages/SignFinishPage";

function App() {
  return (
    <Routes>
      <Route path="/" element={<div>홈</div>} />
      <Route path="/be-labs" element={<BELabs />} />
      <Route path="/emailLogin" element={<EmailLogin />} />
      <Route path="/workflow" element={<WorkflowLabs />} />
      <Route path="/fishSignup" element={<SignFinishPage />} />
    </Routes>
  );
}

export default App;
