export default function GlassCard({ children, className = '', style = {}, onClick }) {
    return (
        <div
            className={`card ${className}`}
            style={style}
            onClick={onClick}
        >
            {children}
        </div>
    );
}
