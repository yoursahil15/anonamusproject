import Header from "./layout/Header";
import { getNavigationItems } from "./layout/navigation";

const readUser = () => {
  try {
    return JSON.parse(localStorage.getItem("user") || "null");
  } catch {
    return null;
  }
};

export default function LegacyNavbarAdapter({ onMenuClick }) {
  const user = readUser();
  return <Header user={user} items={getNavigationItems(user)} onMenuClick={onMenuClick} />;
}
