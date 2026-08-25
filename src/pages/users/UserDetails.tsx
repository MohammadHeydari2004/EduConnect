import Modal from "#/components/ui/Modal.tsx";
import Card from "#/components/ui/Card.tsx";
import type { User } from "#/types/user.ts";

interface UserDetailsProps {
  isOpen: boolean;
  user: User | null;
  onClose: () => void;
}

function UserDetails({ isOpen, user, onClose }: UserDetailsProps) {
  if (!user) return null;

  return (
    <Modal isOpen={isOpen} title="جزئیات کاربر" onClose={onClose}>
      <Card>
        <div className="space-y-3 text-sm text-gray-700">
          <p>
            <span className="font-semibold">نام:</span> {user.name}
          </p>
          <p>
            <span className="font-semibold">ایمیل:</span> {user.email}
          </p>
          <p>
            <span className="font-semibold">نقش:</span> {user.role}
          </p>
          <p>
            <span className="font-semibold">وضعیت:</span> {user.status}
          </p>
        </div>
      </Card>
    </Modal>
  );
}

export default UserDetails;
