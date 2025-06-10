import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Plus, Search, Loader2, Lock } from "lucide-react";
import PasswordItem from "@/components/vault/PasswordItem";
import PasswordForm from "@/components/vault/PasswordForm";
import PasswordGenerator from "@/components/common/PasswordGenerator";
import { Password } from "@shared/schema";

const PasswordVault: React.FC = () => {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");
  const [isAddFormOpen, setIsAddFormOpen] = useState(false);
  const [isPasswordGeneratorOpen, setIsPasswordGeneratorOpen] = useState(false);
  const [selectedPassword, setSelectedPassword] = useState<Password | undefined>(undefined);
  const [generatedPassword, setGeneratedPassword] = useState<string>("");

  // Fetch passwords
  const { data: passwords, isLoading, error } = useQuery<Password[]>({
    queryKey: ['/api/passwords'],
  });

  // Generate a password client-side
  const handleGeneratePassword = () => {
    setIsPasswordGeneratorOpen(true);
  };

  // Handle select generated password
  const handleSelectGeneratedPassword = (password: string) => {
    setGeneratedPassword(password);
    setIsPasswordGeneratorOpen(false);
    setIsAddFormOpen(true);
  };

  // Handle password edit
  const handleEditPassword = (password: Password) => {
    setSelectedPassword(password);
    setGeneratedPassword(""); // Clear any previous generated password
    setIsAddFormOpen(true);
  };

  // Handle close form
  const handleCloseForm = () => {
    setIsAddFormOpen(false);
    setSelectedPassword(undefined);
    setGeneratedPassword("");
  };

  // Filter and search passwords
  const filteredPasswords = passwords
    ? passwords.filter((password: Password) => {
        // Apply category filter
        if (filter !== "all" && filter !== "favorites") {
          if (password.category !== filter) return false;
        }

        // Apply favorites filter
        if (filter === "favorites" && !password.isFavorite) return false;

        // Apply search
        if (search) {
          const searchLower = search.toLowerCase();
          return (
            password.title.toLowerCase().includes(searchLower) ||
            (password.username && password.username.toLowerCase().includes(searchLower)) ||
            (password.url && password.url.toLowerCase().includes(searchLower)) ||
            (password.category && password.category.toLowerCase().includes(searchLower))
          );
        }

        return true;
      })
    : [];

  // Get unique categories for filter
  const categories = passwords
    ? Array.from(new Set(passwords.map((p: Password) => p.category).filter((category): category is string =>
        category !== null && category !== undefined)))
    : [];

  // Handle error state
  if (error) {
    return (
      <div className="flex justify-center items-center py-20">
        <Card className="w-full max-w-md">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <div className="h-16 w-16 rounded-full bg-red-100 dark:bg-red-900/20 flex items-center justify-center mb-4">
              <Lock className="h-8 w-8 text-red-600 dark:text-red-400" />
            </div>
            <p className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">Failed to load passwords</p>
            <p className="text-gray-500 dark:text-gray-400 text-center mb-6">
              There was an error loading your password vault. Please try refreshing the page.
            </p>
            <Button onClick={() => window.location.reload()}>
              Refresh Page
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold text-gray-900 dark:text-gray-100">Password Vault</h1>
        <Button onClick={() => setIsAddFormOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Add Password
        </Button>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500 h-4 w-4" />
          <Input
            placeholder="Search passwords..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={filter} onValueChange={setFilter}>
          <SelectTrigger className="w-full sm:w-40">
            <SelectValue placeholder="Filter" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All</SelectItem>
            <SelectItem value="favorites">Favorites</SelectItem>
            {categories.map((category) => (
              <SelectItem key={category} value={category}>
                {category}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <span className="ml-2 text-lg text-gray-600 dark:text-gray-400">Loading passwords...</span>
        </div>
      ) : filteredPasswords.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filteredPasswords.map((password: Password) => (
            <PasswordItem
              key={password.id}
              password={password}
              onEdit={handleEditPassword}
            />
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            {search || filter !== "all" ? (
              <>
                <div className="h-16 w-16 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center mb-4">
                  <Search className="h-8 w-8 text-gray-400" />
                </div>
                <p className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">No matching passwords found</p>
                <p className="text-gray-500 dark:text-gray-400 text-center mb-6">
                  Try adjusting your search or filter to find what you're looking for.
                </p>
                <Button
                  variant="outline"
                  onClick={() => {
                    setSearch("");
                    setFilter("all");
                  }}
                >
                  Clear filters
                </Button>
              </>
            ) : (
              <>
                <div className="h-16 w-16 rounded-full bg-primary/10 dark:bg-primary/20 flex items-center justify-center mb-4">
                  <Lock className="h-8 w-8 text-primary" />
                </div>
                <p className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">No passwords yet</p>
                <p className="text-gray-500 dark:text-gray-400 text-center mb-6">
                  Start by adding your first password to the vault.
                </p>
                <Button onClick={() => setIsAddFormOpen(true)}>
                  <Plus className="mr-2 h-4 w-4" />
                  Add Password
                </Button>
              </>
            )}
          </CardContent>
        </Card>
      )}

      {/* Password Form */}
      <PasswordForm
        open={isAddFormOpen}
        onClose={handleCloseForm}
        password={selectedPassword}
        onGeneratePassword={handleGeneratePassword}
        generatedPassword={generatedPassword}
      />

      {/* Password Generator Dialog */}
      <Dialog open={isPasswordGeneratorOpen} onOpenChange={setIsPasswordGeneratorOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Generate Password</DialogTitle>
          </DialogHeader>
          <PasswordGenerator
            onSelect={handleSelectGeneratedPassword}
            title=""
            className="border-0 shadow-none"
          />
          <div className="flex justify-end gap-2 mt-4">
            <Button
              variant="outline"
              onClick={() => setIsPasswordGeneratorOpen(false)}
            >
              Cancel
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default PasswordVault;