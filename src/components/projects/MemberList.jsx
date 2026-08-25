import useAuthStore from '../../stores/authStore';

function MemberList({ members, ownerId, isAdmin, onRemove, removeLoading }) {
  const { user } = useAuthStore();

  return (
    <div className="member-list">
      <h3 className="member-list-title">Members ({members.length})</h3>
      <ul className="member-items">
        {members.map((member) => {
          const isOwner = member.user._id === ownerId;
          const isSelf = member.user._id === user?._id;

          return (
            <li key={member.user._id} className="member-item">
              <div className="member-info">
                <span className="member-name">{member.user.name}{isSelf ? ' (you)' : ''}</span>
                <span className="member-email">{member.user.email}</span>
              </div>
              <div className="member-actions">
                <span className={`role-badge ${member.role === 'admin' ? 'role-admin' : 'role-member'}`}>
                  {member.role}
                </span>
                {isAdmin && !isOwner && !isSelf && (
                  <button onClick={() => onRemove(member.user._id, member.user.name)} className="btn btn-danger btn-sm" disabled={removeLoading} type="button">
                    Remove
                  </button>
                )}
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

export default MemberList;
