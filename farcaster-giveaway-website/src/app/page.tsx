'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { WalletConnect } from '@/components/WalletConnect';
import { useWallet } from '@/contexts/WalletContext';
import { Loader2, Trophy, Users, Gift, Link2, Shuffle, User, Crown, Wallet } from 'lucide-react';

interface Winner {
  username: string;
  fid: number;
  displayName: string;
  pfp: string;
}

export default function GiveawayPage() {
  const [postUrl, setPostUrl] = useState('');
  const [winnerCount, setWinnerCount] = useState(1);
  const [winners, setWinners] = useState<Winner[]>([]);
  const [isDrawing, setIsDrawing] = useState(false);
  const [totalComments, setTotalComments] = useState(0);
  const [hasDrawn, setHasDrawn] = useState(false);
  const { user, isConnected } = useWallet();

  const handleStartDraw = async () => {
    if (!isConnected) {
      alert('Silakan connect wallet terlebih dahulu untuk memulai giveaway');
      return;
    }

    if (!postUrl.trim()) {
      alert('Silakan masukkan link postingan Farcaster terlebih dahulu');
      return;
    }

    if (winnerCount < 1) {
      alert('Jumlah pemenang harus minimal 1');
      return;
    }

    setIsDrawing(true);
    setWinners([]);
    setHasDrawn(false);

    try {
      // Extract cast hash from URL
      let castHash = '';
      if (postUrl.includes('warpcast.com')) {
        const parts = postUrl.split('/');
        castHash = parts[parts.length - 1];
        // Remove any query parameters
        castHash = castHash.split('?')[0];
      } else if (postUrl.includes('app.farcaster.xyz')) {
        const parts = postUrl.split('/');
        castHash = parts[parts.length - 1];
        // Remove any query parameters
        castHash = castHash.split('?')[0];
      } else {
        // Assume it's already a hash
        castHash = postUrl;
      }

      // Validate cast hash format (should start with 0x)
      if (!castHash.startsWith('0x') || castHash.length < 10) {
        throw new Error('Format link postingan tidak valid. Pastikan menggunakan link Warpcast yang benar.');
      }

      const response = await fetch('/api/draw-winners', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          castHash,
          winnerCount,
          hostFid: user?.fid // Include host FID for tracking
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Gagal mengambil data komentar');
      }

      setWinners(data.winners);
      setTotalComments(data.totalComments);
      setHasDrawn(true);
    } catch (error) {
      console.error('Error:', error);
      alert(error instanceof Error ? error.message : 'Terjadi kesalahan saat mengundang pemenang');
    } finally {
      setIsDrawing(false);
    }
  };

  const handleReset = () => {
    setPostUrl('');
    setWinnerCount(1);
    setWinners([]);
    setTotalComments(0);
    setHasDrawn(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8 pt-8">
          <div className="flex justify-between items-start mb-6">
            <div className="text-center flex-1">
              <div className="flex justify-center mb-4">
                <div className="p-3 bg-gradient-to-r from-purple-600 to-pink-600 rounded-2xl">
                  <Trophy className="w-8 h-8 text-white" />
                </div>
              </div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-2">
                Farcaster Giveaway Draw
              </h1>
              <p className="text-gray-600 text-lg">
                Undi pemenang giveaway dari komentar postingan Farcaster
              </p>
            </div>
            <div className="flex items-center gap-4">
              {isConnected && user && (
                <Card className="bg-gradient-to-r from-purple-50 to-pink-50 border-purple-200">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-12 w-12">
                        <AvatarImage src={user.pfp} alt={user.displayName} />
                        <AvatarFallback>
                          {user.displayName.slice(0, 2).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="font-semibold text-sm">{user.displayName}</p>
                          <Badge variant="secondary" className="text-xs">
                            <Crown className="w-3 h-3 mr-1" />
                            Host
                          </Badge>
                        </div>
                        <p className="text-xs text-gray-600">@{user.username}</p>
                        <p className="text-xs text-gray-500">FID: {user.fid}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
              <WalletConnect />
            </div>
          </div>
        </div>

        {/* Main Card */}
        <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-2xl">
              <Gift className="w-6 h-6 text-purple-600" />
              Pengaturan Giveaway
            </CardTitle>
            <CardDescription>
              Masukkan link postingan Farcaster dan tentukan jumlah pemenang
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Post URL Input */}
            <div className="space-y-2">
              <Label htmlFor="postUrl" className="text-sm font-medium flex items-center gap-2">
                <Link2 className="w-4 h-4" />
                Link Postingan Farcaster
              </Label>
              <Input
                id="postUrl"
                type="text"
                placeholder="https://warpcast.com/username/0x..."
                value={postUrl}
                onChange={(e) => setPostUrl(e.target.value)}
                className="w-full"
                disabled={isDrawing}
              />
              <div className="space-y-1">
                <p className="text-xs text-gray-500">
                  Contoh: https://warpcast.com/username/0x1234567890abcdef
                </p>
                <details className="text-xs text-gray-400">
                  <summary className="cursor-pointer hover:text-gray-600">Bantuan format link</summary>
                  <div className="mt-2 space-y-1">
                    <p>• Warpcast: https://warpcast.com/username/0xhash</p>
                    <p>• Farcaster App: https://app.farcaster.xyz/0xhash</p>
                    <p>• Hash langsung: 0x1234567890abcdef</p>
                  </div>
                </details>
              </div>
            </div>

            {/* Winner Count */}
            <div className="space-y-2">
              <Label htmlFor="winnerCount" className="text-sm font-medium flex items-center gap-2">
                <Users className="w-4 h-4" />
                Jumlah Pemenang
              </Label>
              <Input
                id="winnerCount"
                type="number"
                min="1"
                max="100"
                value={winnerCount}
                onChange={(e) => setWinnerCount(parseInt(e.target.value) || 1)}
                className="w-full max-w-xs"
                disabled={isDrawing}
              />
            </div>

            <Separator />

            {/* Action Buttons */}
            <div className="flex gap-3">
              <Button
                onClick={handleStartDraw}
                disabled={isDrawing || !postUrl.trim() || !isConnected}
                className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
                size="lg"
              >
                {isDrawing ? (
                  <>
                    <div className="w-4 h-4 mr-2 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Sedang Mengundi...
                  </>
                ) : !isConnected ? (
                  <>
                    <Wallet className="w-4 h-4 mr-2" />
                    Connect Wallet to Start
                  </>
                ) : (
                  <>
                    <Shuffle className="w-4 h-4 mr-2" />
                    Mulai Mengundi
                  </>
                )}
              </Button>
              {hasDrawn && (
                <Button
                  onClick={handleReset}
                  variant="outline"
                  size="lg"
                >
                  Reset
                </Button>
              )}
            </div>

            {!isConnected && (
              <div className="text-center py-4">
                <p className="text-sm text-gray-600">
                  <User className="w-4 h-4 inline mr-2" />
                  Connect wallet Anda untuk menjadi host giveaway
                </p>
              </div>
            )}

            {/* Loading Animation */}
            {isDrawing && (
              <div className="text-center py-8">
                <div className="inline-flex items-center justify-center space-x-2">
                  <div className="w-3 h-3 bg-purple-600 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                  <div className="w-3 h-3 bg-pink-600 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                  <div className="w-3 h-3 bg-purple-600 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                </div>
                <p className="mt-4 text-sm text-gray-600">Mengambil komentar dan memilih pemenang...</p>
              </div>
            )}

            {/* Results Section */}
            {hasDrawn && (
              <div className="mt-8 space-y-4">
                <div className="text-center">
                  <Badge variant="secondary" className="text-sm px-3 py-1">
                    Total Komentar: {totalComments}
                  </Badge>
                </div>

                <Separator />

                <div className="space-y-3">
                  <h3 className="text-lg font-semibold flex items-center gap-2">
                    <Trophy className="w-5 h-5 text-yellow-500" />
                    Pemenang Giveaway
                  </h3>

                  {winners.length > 0 ? (
                    <div className="grid gap-3">
                      {winners.map((winner, index) => (
                        <Card key={index} className="border-l-4 border-l-gradient-to-r from-purple-500 to-pink-500 bg-gradient-to-r from-purple-50 to-pink-50">
                          <CardContent className="p-4">
                            <div className="flex items-center gap-3">
                              <div className="flex-shrink-0">
                                <div className="w-12 h-12 rounded-full bg-gradient-to-r from-purple-400 to-pink-400 flex items-center justify-center text-white font-bold">
                                  {index + 1}
                                </div>
                              </div>
                              <div className="flex-1">
                                <div className="flex items-center gap-2">
                                  <p className="font-semibold text-gray-900">
                                    {winner.displayName || winner.username}
                                  </p>
                                  <Badge variant="outline" className="text-xs">
                                    @{winner.username}
                                  </Badge>
                                </div>
                                <p className="text-sm text-gray-600">
                                  FID: {winner.fid}
                                </p>
                              </div>
                              {winner.pfp && (
                                <img
                                  src={winner.pfp}
                                  alt={winner.username}
                                  className="w-10 h-10 rounded-full"
                                />
                              )}
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      <Users className="w-12 h-12 mx-auto mb-3 opacity-50" />
                      <p>Tidak ada komentar yang ditemukan untuk postingan ini</p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="text-center mt-8 text-sm text-gray-600">
          <p>Powered by Neynar API • Farcaster Giveaway Tool</p>
        </div>
      </div>
    </div>
  );
}