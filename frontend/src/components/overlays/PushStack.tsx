import { useNavigate } from "react-router-dom";
import { useAlert } from "../../state/AlertContext";
import { STAGE_COLORS } from "../../lib/demo";
import { AegisLogo } from "../brand/AegisLogo";

export function PushStack() {
  const { pushVisible, hidePush, effectiveStage, activeModule } = useAlert();
  const navigate = useNavigate();
  if (!pushVisible) return null;

  const s = activeModule.stages[effectiveStage - 1];
  const c = STAGE_COLORS[effectiveStage];

  const onTap = () => {
    hidePush();
    navigate("/alert");
  };

  return (
    <div className="push-stack">
      <div className="push-card" onClick={onTap}>
        <div className="pc-app" style={{ background: c.bg, color: c.ink }}>
          <AegisLogo size={20} color={c.ink} mark={c.bg} />
        </div>
        <div className="pc-body">
          <div className="pc-row">
            <span style={{ fontWeight: 600 }}>AEGIS</span>
            <span style={{ opacity: 0.6 }}>· {s.short.toUpperCase()}</span>
            <span className="pc-time">now</span>
          </div>
          <div className="pc-title">{s.headline}</div>
          <div className="pc-msg">{s.blurb}</div>
        </div>
      </div>
    </div>
  );
}
