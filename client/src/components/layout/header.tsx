import { useState } from "react";
import { Link, useLocation } from "wouter";
import { useAuth } from "@/lib/auth";
import { BriefcaseMedical, ShoppingCart, Bell, Menu, User } from "lucide-react";
import { 
  Sheet, 
  SheetContent, 
  SheetTrigger 
} from "@/components/ui/sheet";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";

export function Header() {
  const { user, logout } = useAuth();
  const [location] = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  const navigation = [
    { name: "Dashboard", href: "/" },
    { name: "Medicines", href: "/medicines" },
    { name: "Prescriptions", href: "/prescriptions" },
    { name: "Orders", href: "/orders" },
  ];

  const userInitials = user?.fullName
    ? user.fullName
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
    : "?";

  return (
    <header className="bg-white shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <div className="flex-shrink-0 flex items-center">
              <BriefcaseMedical className="h-6 w-6 text-primary" />
              <span className="text-lg font-semibold ml-2">E-Pharmacy</span>
            </div>
            <nav className="hidden md:ml-6 md:flex space-x-8">
              {navigation.map((item) => (
                <Link 
                  key={item.name} 
                  href={item.href}
                  className={`${
                    location === item.href
                      ? "text-primary border-b-2 border-primary"
                      : "text-gray-500 hover:text-gray-700"
                  } px-3 py-2 text-sm font-medium`}
                >
                  {item.name}
                </Link>
              ))}
            </nav>
          </div>
          
          <div className="flex items-center">
            {user ? (
              <>
                <div className="flex-shrink-0">
                  <Button variant="ghost" size="icon" className="relative">
                    <ShoppingCart className="h-5 w-5" />
                    <span className="absolute top-0 right-0 block h-4 w-4 rounded-full bg-primary text-xs text-white font-medium flex items-center justify-center">
                      0
                    </span>
                  </Button>
                </div>
                <div className="hidden md:ml-4 md:flex-shrink-0 md:flex md:items-center">
                  <Button variant="ghost" size="icon">
                    <Bell className="h-5 w-5" />
                  </Button>
                  <div className="ml-3 relative">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="rounded-full">
                          <Avatar>
                            <AvatarFallback>{userInitials}</AvatarFallback>
                          </Avatar>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <div className="px-4 py-3">
                          <p className="text-sm font-medium">{user.fullName}</p>
                          <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                        </div>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem>
                          <User className="mr-2 h-4 w-4" />
                          <span>Profile</span>
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => logout()}>
                          Log out
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              </>
            ) : (
              <div className="hidden md:flex space-x-4">
                <Button variant="ghost" asChild>
                  <Link href="/login">Login</Link>
                </Button>
                <Button asChild>
                  <Link href="/register">Register</Link>
                </Button>
              </div>
            )}
            <div className="-mr-2 flex md:hidden">
              <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="icon">
                    <Menu className="h-6 w-6" />
                    <span className="sr-only">Open menu</span>
                  </Button>
                </SheetTrigger>
                <SheetContent side="left">
                  <div className="mt-6 flow-root">
                    <div className="py-4">
                      <div className="flex items-center mb-6">
                        <BriefcaseMedical className="h-6 w-6 text-primary" />
                        <span className="text-lg font-semibold ml-2">E-Pharmacy</span>
                      </div>
                      <div className="space-y-1">
                        {navigation.map((item) => (
                          <Link
                            key={item.name}
                            href={item.href}
                            className={`${
                              location === item.href
                                ? "bg-primary-50 text-primary"
                                : "text-gray-500 hover:bg-gray-50 hover:text-gray-700"
                            } block px-3 py-2 rounded-md text-base font-medium`}
                            onClick={() => setMobileMenuOpen(false)}
                          >
                            {item.name}
                          </Link>
                        ))}
                      </div>
                      {user && (
                        <div className="mt-4 pt-4 border-t border-gray-200">
                          <div className="flex items-center px-3">
                            <div className="flex-shrink-0">
                              <Avatar>
                                <AvatarFallback>{userInitials}</AvatarFallback>
                              </Avatar>
                            </div>
                            <div className="ml-3">
                              <div className="text-base font-medium text-gray-800">
                                {user.fullName}
                              </div>
                              <div className="text-sm font-medium text-gray-500">
                                {user.email}
                              </div>
                            </div>
                          </div>
                          <div className="mt-3 space-y-1">
                            <Link
                              href="/profile"
                              className="block px-4 py-2 text-base font-medium text-gray-500 hover:text-gray-800 hover:bg-gray-100"
                              onClick={() => setMobileMenuOpen(false)}
                            >
                              Your Profile
                            </Link>
                            <button
                              onClick={() => {
                                logout();
                                setMobileMenuOpen(false);
                              }}
                              className="block w-full text-left px-4 py-2 text-base font-medium text-gray-500 hover:text-gray-800 hover:bg-gray-100"
                            >
                              Sign out
                            </button>
                          </div>
                        </div>
                      )}
                      {!user && (
                        <div className="mt-4 space-y-2 pt-4 border-t border-gray-200">
                          <Button variant="outline" className="w-full" asChild>
                            <Link href="/login" onClick={() => setMobileMenuOpen(false)}>
                              Login
                            </Link>
                          </Button>
                          <Button className="w-full" asChild>
                            <Link href="/register" onClick={() => setMobileMenuOpen(false)}>
                              Register
                            </Link>
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                </SheetContent>
              </Sheet>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
