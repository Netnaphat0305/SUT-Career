// src/layouts/FullLayout/index.tsx
import React from "react";
import { Link, useLocation, Outlet, useOutletContext, useNavigate } from "react-router-dom";
import { 
  Layout, 
  Menu, 
  theme, 
  Button, 
  Flex, 
  Space, 
  Dropdown,
} from "antd";
import type { MenuProps } from "antd";
import { DownOutlined, BellOutlined, UserOutlined, LogoutOutlined, LoginOutlined } from "@ant-design/icons";
import logoImage from "../../assets/logo.svg";

const { Header, Content, Footer } = Layout;

type MenuItem = Required<MenuProps>["items"][number];

const createMenuItem = (key: string, label: React.ReactNode): MenuItem => {
  const path = key === "home" ? "/" : `/${key}`;
  return {
    key,
    label: <Link to={path}>{label}</Link>,
    style: { paddingInline: "20px" },
  } as MenuItem;
};

const navItems: MenuItem[] = [
  createMenuItem("home", "Home"),
  createMenuItem("Job/Board", "Jobs"),
  createMenuItem("my-jobs", "My Job"),
  createMenuItem("payment-report", "Payment Report"),
  createMenuItem("help", "Help"),
  createMenuItem("chat", "Chat"),
  createMenuItem("interview", "Interview Table"),
  createMenuItem("students", "Students List"),
  createMenuItem("report", "Report"),
  createMenuItem("feed", "Feed"),
  createMenuItem("Interview-Schedule", "Interview Schedule"),
];

const FullLayout: React.FC = () => {
  const {
    token: { colorText },
  } = theme.useToken();

  const location = useLocation();
  const navigate = useNavigate();
  const context = useOutletContext();

  // current selected key for top menu
  const currentPageKey = location.pathname.split("/")[1] || "home";

  // read auth info
  const user = React.useMemo(() => {
    try {
      return JSON.parse(localStorage.getItem("user") || "{}");
    } catch {
      return {};
    }
  }, []);
  const role: string | undefined = user?.role;
  const isLoggedIn = !!localStorage.getItem("token");

  // dropdown menu actions
  const onProfileMenuClick = ({ key }: { key: string }) => {
    if (key === "profile") {
      if (role === "employer") {
        navigate("/employer/profile");
      } else if (role === "student") {
        navigate("/student/profile");
      } else {
        navigate("/login");
      }
    }
    if (key === "logout") {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      navigate("/login");
    }
  };

  const profileMenu: MenuProps = {
    items: [
      { key: "profile", icon: <UserOutlined />, label: "Profile" },
      { type: "divider" },
      { key: "logout", icon: <LogoutOutlined />, label: "Logout" },
    ],
    onClick: onProfileMenuClick,
  };

  return (
    <Layout style={{ minHeight: "auto" }}>
      <Header
        style={{
          position: "sticky",
          top: 0,
          zIndex: 1,
          width: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          backgroundColor: "#fff",
          padding: "0 24px",
          height: 64,
          borderBottom: "1px solid #f0f0f0",
        }}
      >
        {/* Left: logo + nav */}
        <div style={{ display: "flex", alignItems: "center", flex: 1, minWidth: 0 }}>
          <div className="website-logo" style={{ marginRight: 24 }}>
            <Link to="/">
              <img
                src={logoImage}
                alt="SUT Career Logo"
                style={{ 
                  height: "50px",
                  width: "auto",
                  display: "block",
                }}
              />
            </Link>
          </div>

          <Menu
            theme="light"
            mode="horizontal"
            selectedKeys={[currentPageKey]}
            items={navItems}
            style={{
              borderBottom: "none",
              flex: 1,
              minWidth: 0,
              justifyContent: "flex-start",
            }}
          />
        </div>

        {/* Right: notif + language + profile/login */}
        <Flex align="center">
          <Space size="middle">
            <BellOutlined style={{ fontSize: 20, color: colorText }} />

            <Dropdown
              menu={{
                items: [{ key: "th", label: "TH" }],
              }}
            >
              <Button type="text" style={{ fontSize: 16, color: colorText }}>
                <Space>
                  TH
                  <DownOutlined />
                </Space>
              </Button>
            </Dropdown>

            {isLoggedIn ? (
              <Dropdown menu={profileMenu} trigger={["click"]}>
                <Button
                  type="text"
                  style={{
                    fontSize: 20,
                    border: "1px solid #d9d9d9",
                    borderRadius: 6,
                    color: "#0088FF",
                  }}
                >
                  Profile
                </Button>
              </Dropdown>
            ) : (
              <Button
                type="text"
                icon={<LoginOutlined />}
                onClick={() => navigate("/login")}
                style={{
                  fontSize: 16,
                  border: "1px solid #d9d9d9",
                  borderRadius: 6,
                  color: "#0088FF",
                }}
              >
                Login
              </Button>
            )}
          </Space>
        </Flex>
      </Header>

      <Content>
        <Outlet context={context} />
      </Content>

      <Footer style={{ textAlign: "center" }}>
        SUT Career ©{new Date().getFullYear()} Created with Ant Design
      </Footer>
    </Layout>
  );
};

export default FullLayout;
