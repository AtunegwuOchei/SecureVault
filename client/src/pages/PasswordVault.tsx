import React, { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
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
import { Plus, Search, Loader2 } from "lucide-react";
import PasswordItem from "@/components/vault/PasswordItem";
import PasswordForm from "@/components/vault/PasswordForm";
import PasswordGenerator from "@/components/common/PasswordGenerator";
import { Password } from "@shared/schema";
import { generatePassword } from "@/lib/passwordUtils";

const PasswordVault: React.FC = () => {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");
  const [isAddFormOpen, setIsAddFormOpen] = useState(false);
  const [isPasswordGeneratorOpen, setIsPasswordGeneratorOpen] = useState(false);
  const [selectedPassword, setSelectedPassword] = useState<Password | undefined>(undefined);
  const [generatedPassword, setGeneratedPassword] = useState<string>("");
  
  // Fetch passwords
  const { data: passwords, isLoading } = useQuery({
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
    setIsAddFormOpen(true);
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
            password.username.toLowerCase().includes(searchLower) ||
            (password.url && password.url.toLowerCase().includes(searchLower)) ||
            (password.category && password.category.toLowerCase().includes(searchLower))
          );
        }
        
        return true;
      })
    : [];

  // Get unique categories for filter
  const categories = passwords
    ? Array.from(new Set(passwords.map((p: Password) => p.category).filter(Boolean)))
    : [];

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
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500" />
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
                <div className="h-16 w-16 rounded-full bg-primary-100 dark:bg-primary-900/20 flex items-center justify-center mb-4">
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
        onClose={() => {
          setIsAddFormOpen(false);
          setSelectedPassword(undefined);
          setGeneratedPassword("");
        }}
        password={selectedPassword}
        onGeneratePassword={handleGeneratePassword}
        generatedPassword={generatedPassword}
      />

      {/* Password Generator Dialog */}
      {isPasswordGeneratorOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="w-full max-w-md">
            <PasswordGenerator
              onSelect={handleSelectGeneratedPassword}
              title="Generate a Strong Password"
            />
            <div className="mt-4 flex justify-end">
              <Button 
                variant="outline" 
                onClick={() => setIsPasswordGeneratorOpen(false)}
              >
                Cancel
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Ensure the Lock icon is defined
const Lock = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
  </svg>
);

export default PasswordVault;
