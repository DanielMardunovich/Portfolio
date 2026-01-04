export default function PartyMember({ icon, link }) {
    return (
        <a className="member game" href={link} target="_blank">
            <div className="unit">
                <img src={icon} alt="" />
            </div>
        </a>
    );
}
