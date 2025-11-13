'use client';

import { useState } from 'react';
import { useWallet } from '../contexts/WalletContext';
import { Button } from './ui/button';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from './ui/dropdown-menu';
import { Badge } from './ui/badge';
import { Wallet, User, LogOut, Copy, Check } from 'lucide-react';

export function WalletConnect() {
  const { user, isConnected, isLoading, connectWallet, disconnectWallet } = useWallet();
  const [copiedFid, setCopiedFid] = useState(false);

  const handleCopyFid = () => {
    if (user?.fid) {
      navigator.clipboard.writeText(user.fid.toString());
      setCopiedFid(true);
      setTimeout(() => setCopiedFid(false), 2000);
    }
  };

  if (isConnected && user) {
    return (
      <div className="flex items-center gap-3">
        <Badge variant="secondary" className="text-xs">
          FID: {user.fid}
        </Badge>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="relative h-10 w-10 rounded-full">
              <Avatar className="h-10 w-10">
                <AvatarImage src={user.pfp} alt={user.displayName} />
                <AvatarFallback>
                  {user.displayName.slice(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56" align="end">
            <div className="flex items-center justify-start gap-2 p-2">
              <div className="flex flex-col space-y-1 leading-none">
                <p className="font-medium">{user.displayName}</p>
                <p className="w-[200px] truncate text-sm text-muted-foreground">
                  @{user.username}
                </p>
              </div>
            </div>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleCopyFid}>
              <User className="mr-2 h-4 w-4" />
              <span>Copy FID</span>
              {copiedFid && <Check className="ml-auto h-4 w-4 text-green-600" />}
            </DropdownMenuItem>
            <DropdownMenuItem onClick={disconnectWallet}>
              <LogOut className="mr-2 h-4 w-4" />
              <span>Disconnect</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    );
  }

  return (
    <Button 
      onClick={connectWallet} 
      disabled={isLoading}
      className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
    >
      {isLoading ? (
        <>
          <div className="w-4 h-4 mr-2 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          Connecting...
        </>
      ) : (
        <>
          <Wallet className="w-4 h-4 mr-2" />
          Connect Wallet
        </>
      )}
    </Button>
  );
}