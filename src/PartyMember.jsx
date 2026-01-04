export default function PartyMember({ icon, link, alt }) {
    return (
        <a
            className="member game"
            href={link}
            target="_blank"
            rel="noreferrer"
        >
            <div className="unit">
                <img src={icon} alt={alt} />
            </div>
        </a>
    );
}
