import './CaptionHeader.css';

interface CaptionHeaderProps {
  facilityName: string;
  department: string;
}

export default function CaptionHeader({ facilityName, department }: CaptionHeaderProps) {
  return (
    <div className="caption-header">
      <div className="caption-header__indicator">
        <span className="pulse-dot" aria-hidden="true" />
        <span className="caption-header__label">Live Captions</span>
      </div>
      <div className="caption-header__facility">
        <span className="facility-name">{facilityName}</span>
        <span className="facility-dept">{department}</span>
      </div>
    </div>
  );
}
