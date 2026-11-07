import Sidebar from "./layout/Sidebar";
import { getNavigationItems } from "./layout/navigation";

const readUser = () => {
  try {
    return JSON.parse(localStorage.getItem("user") || "null");
  } catch {
    return null;
  }
};

export default function LegacySidebarAdapter(props) {
  const user = readUser();
  return <Sidebar {...props} user={user} items={getNavigationItems(user)} />;
}
