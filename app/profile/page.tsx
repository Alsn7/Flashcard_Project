import { AuthGuard } from "@/components/auth/AuthGuard";
import { ProfileContent } from "@/components/profile/ProfileContent";

export default function ProfilePage() {
  return (
    <AuthGuard>
      <ProfileContent />
    </AuthGuard>
  );
}
