import Card from "#/components/ui/Card.tsx";
import Modal from "#/components/ui/Modal.tsx";
import type { User } from "#/types/user.ts";

interface UserDetailsProps {
  isOpen: boolean;
  user: User | null;
  onClose: () => void;
}

const getRoleLabel = (role: string) => {
  switch (role) {
    case "admin":
      return "مدیر";
    case "teacher":
      return "استاد";
    case "student":
      return "دانشجو";
    default:
      return role;
  }
};

const getStatusLabel = (status: string) => {
  switch (status) {
    case "active":
      return "فعال";
    case "inactive":
      return "غیرفعال";
    default:
      return status;
  }
};

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
            <span className="font-semibold">نقش:</span>{" "}
            {getRoleLabel(user.role)}
          </p>
          <p>
            <span className="font-semibold">وضعیت:</span>{" "}
            {getStatusLabel(user.status)}
          </p>
        </div>
      </Card>
    </Modal>
  );
}

export default UserDetails;
