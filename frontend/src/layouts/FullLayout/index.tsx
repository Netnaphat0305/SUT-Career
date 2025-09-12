// src/layouts/FullLayout/index.tsx
import React from "react";
import { Link, useLocation, Outlet, useOutletContext } from "react-router-dom";
import { 
  Layout, 
  Menu, 
  theme, 
  Button, 
  Flex, 
  Space, 
  Dropdown,
} from "antd";
import { DownOutlined, UserOutlined, LogoutOutlined, ProfileOutlined , ExclamationCircleOutlined  } from "@ant-design/icons";
import type { MenuProps } from "antd";
import logoImage from '../../assets/logo.svg';
// Import useAuth to get user and logout function
import { useAuth } from "../../context/AuthContext"; 

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
  createMenuItem("interview","Interview Table"),
  createMenuItem("worklog","Worklog"),
  createMenuItem("report","Report"),
  createMenuItem("feed", "Feed"),
  createMenuItem("Interview-Schedule", "Interview Schedule"),
];

const FullLayout: React.FC = () => {
  const {
    token: { colorText },
  } = theme.useToken();

  const location = useLocation();
  const context = useOutletContext();

  // current selected key for top menu
  const currentPageKey = location.pathname.split("/")[1] || "home";


  // read auth info
  // const user = React.useMemo(() => {
  //   try {
  //     return JSON.parse(localStorage.getItem("user") || "{}");
  //   } catch {
  //     return {};
  //   }
  // }, []);
  // const role: string | undefined = user?.role;
  // const isLoggedIn = !!localStorage.getItem("token");

  // // dropdown menu actions
  // const onProfileMenuClick = ({ key }: { key: string }) => {
  //   if (key === "profile") {
  //     if (role === "employer") {
  //       navigate("/employer/profile");
  //     } else if (role === "student") {
  //       navigate("/student/profile");
  //     } else {
  //       navigate("/login");
  //     }
  //   }
  //   if (key === "logout") {
  //     localStorage.removeItem("token");
  //     localStorage.removeItem("user");
  //     navigate("/login");
  //   }
  // };

  // const profileMenu: MenuProps = {
  //   items: [
  //     { key: "profile", icon: <UserOutlined />, label: "Profile" },
  //     { type: "divider" },
  //     { key: "logout", icon: <LogoutOutlined />, label: "Logout" },
  //   ],
  //   onClick: onProfileMenuClick,
  // };

  // Get user and logout function from AuthContext
  const { user, logout } = useAuth();

  // Dynamically create menu items based on user role
  const menuItems: MenuProps['items'] = [];

  if (user) {
    // Check if user is a student (case-insensitive check)
    const userRole = user.role.toLowerCase();
    if (userRole === 'student' || userRole === 'stu') {
        menuItems.push({
            key: 'profile',
            label: <Link to="/profile">ดูโปรไฟล์</Link>,
            icon: <ProfileOutlined />,
        });
    }

    //edit by netnaphat copy satang แก้้ให้ employer มีปุ่มโปรไฟล์
    else if (userRole === 'employer' || userRole === 'emp') {
        menuItems.push({
            key: 'employer-profile',
            label: <Link to="/employer/profile">ดูโปรไฟล์</Link>,
            icon: <ProfileOutlined />,
        });
    }
    menuItems.push({
        key: 'logout',
        label: <Link to="/list-report">ดูรายงานของฉัน</Link>,
        icon: <ExclamationCircleOutlined />,
    });
    // Add logout option for all logged-in users
    menuItems.push({
        key: 'logout',
        label: 'ออกจากระบบ',
        icon: <LogoutOutlined />,
        onClick: logout, // Call logout function on click
        danger: true,
    });

    
  }


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



              {/* {isLoggedIn ? ( 
            //   <Dropdown menu={profileMenu} trigger={["click"]}>
            //     <Button
            //       type="text"
            //       style={{
            //         fontSize: 20,
            //         border: "1px solid #d9d9d9",
            //         borderRadius: 6,
            //         color: "#0088FF",
            //       }}
            //     >
            //       Profile
            //     </Button>
            //   </Dropdown>
            // ) : (
            //   <Button
            //     type="text"
            //     icon={<LoginOutlined />}
            //     onClick={() => navigate("/login")}
            //     style={{
            //       fontSize: 16,
            //       border: "1px solid #d9d9d9",
            //       borderRadius: 6,
            //       color: "#0088FF",
            //     }}
            //   >
            //     Login
            //   </Button> */}

            
            {/* Conditional rendering for user profile/login */}
            {user ? (
                 <Dropdown menu={{ items: menuItems }} trigger={['click']}>
                    <Button
                        type="text"
                        style={{
                            fontSize: "16px",
                            border: "1px solid #d9d9d9",
                            borderRadius: "6px",
                            color: "#0088FF",
                            display: 'flex',
                            alignItems: 'center',
                            padding: '4px 15px'
                        }}
                    >
                        <Space>
                            <UserOutlined />
                            {user.username}
                            <DownOutlined />
                        </Space>
                    </Button>
                </Dropdown>
            ) : (
                <Link to="/login">
                    <Button type="primary">เข้าสู่ระบบ</Button>
                </Link>

            )};
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
