
import { useEffect } from "react";
import { Navigate, Link, useNavigate } from "react-router-dom";
import { Container } from "@/components/ui/Container";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { MotionDiv } from "@/components/ui/MotionDiv";
import { Button } from "@/components/ui/button";
import { useCart } from "@/contexts/CartContext";
import { useAuth } from "@/contexts/AuthContext";
import { Trash2, Minus, Plus, ShoppingBag } from "lucide-react";
import { AnimatedImage } from "@/components/ui/AnimatedImage";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";

export default function Cart() {
  const { user, loading: authLoading } = useAuth();
  const { cartItems, totalItems, totalAmount, removeFromCart, updateQuantity, clearCart, loading: cartLoading } = useCart();
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    // If user is not authenticated and auth is finished loading, redirect to auth page
    if (!authLoading && !user) {
      navigate("/auth");
    }
  }, [user, authLoading, navigate]);
  
  const handleQuantityChange = async (cartItemId: string, newQuantity: number) => {
    try {
      if (newQuantity > 0) {
        await updateQuantity(cartItemId, newQuantity);
      } else {
        await removeFromCart(cartItemId);
      }
    } catch (error) {
      console.error("Error updating quantity:", error);
      toast({
        title: "Error",
        description: "Failed to update quantity",
        variant: "destructive",
      });
    }
  };
  
  const handleRemoveItem = async (cartItemId: string) => {
    try {
      await removeFromCart(cartItemId);
    } catch (error) {
      console.error("Error removing item:", error);
      toast({
        title: "Error",
        description: "Failed to remove item from cart",
        variant: "destructive",
      });
    }
  };
  
  const handleClearCart = async () => {
    try {
      await clearCart();
    } catch (error) {
      console.error("Error clearing cart:", error);
      toast({
        title: "Error",
        description: "Failed to clear cart",
        variant: "destructive",
      });
    }
  };
  
  // Loading state while determining authentication
  if (authLoading) {
    return (
      <>
        <Header />
        <main className="pt-20 min-h-screen">
          <Container>
            <div className="text-center py-16">
              <h3 className="text-lg mb-2">Loading...</h3>
            </div>
          </Container>
        </main>
        <Footer />
      </>
    );
  }
  
  // Redirect to login if not authenticated
  if (!user) {
    return <Navigate to="/auth" replace />;
  }
  
  return (
    <>
      <Header />
      <main className="pt-20 min-h-screen">
        <Container>
          <MotionDiv animation="fade-in" className="mb-12 mt-12">
            <h1 className="text-4xl md:text-5xl font-medium text-center mb-3">
              Your Cart
            </h1>
            <p className="text-muted-foreground text-center max-w-2xl mx-auto">
              Review your selected items before checkout
            </p>
          </MotionDiv>
          
          {cartLoading ? (
            <div className="text-center py-16">
              <h3 className="text-lg mb-2">Loading your cart...</h3>
            </div>
          ) : cartItems.length === 0 ? (
            <div className="text-center py-16">
              <div className="mb-6">
                <ShoppingBag className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-xl font-medium mb-2">Your cart is empty</h3>
                <p className="text-muted-foreground mb-8">
                  Add some delicious items from our menu to get started
                </p>
                <Button asChild>
                  <Link to="/menu">Browse Menu</Link>
                </Button>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-16">
              <div className="lg:col-span-2">
                <div className="bg-white border rounded-lg overflow-hidden">
                  <div className="p-4 border-b flex justify-between items-center">
                    <h2 className="text-lg font-medium">Cart Items ({totalItems})</h2>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="text-sm"
                      onClick={handleClearCart}
                    >
                      Clear Cart
                    </Button>
                  </div>
                  
                  <div className="divide-y">
                    {cartItems.map((item) => (
                      <div key={item.id} className="p-4 flex items-start gap-4">
                        <div className="w-20 h-20 flex-shrink-0 rounded-md overflow-hidden">
                          <AnimatedImage
                            src={item.menu_item?.image || ""}
                            alt={item.menu_item?.name || ""}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        
                        <div className="flex-grow">
                          <h3 className="font-medium">{item.menu_item?.name}</h3>
                          <p className="text-sm text-muted-foreground mb-2">
                            {item.menu_item?.description?.substring(0, 80)}
                            {(item.menu_item?.description?.length || 0) > 80 ? "..." : ""}
                          </p>
                          
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-1">
                              <button 
                                onClick={() => handleQuantityChange(item.id, item.quantity - 1)}
                                className={cn(
                                  "p-1 rounded-full border",
                                  "hover:bg-muted transition-colors"
                                )}
                              >
                                <Minus className="h-3 w-3" />
                              </button>
                              <span className="w-8 text-center">{item.quantity}</span>
                              <button 
                                onClick={() => handleQuantityChange(item.id, item.quantity + 1)}
                                className={cn(
                                  "p-1 rounded-full border",
                                  "hover:bg-muted transition-colors"
                                )}
                              >
                                <Plus className="h-3 w-3" />
                              </button>
                            </div>
                            
                            <div className="flex items-center gap-3">
                              <div className="font-medium">
                                ₹{((item.menu_item?.price || 0) * item.quantity).toFixed(0)}
                              </div>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handleRemoveItem(item.id)}
                                className="text-muted-foreground hover:text-destructive h-8 w-8"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              
              <div className="lg:col-span-1">
                <div className="bg-white border rounded-lg overflow-hidden sticky top-24">
                  <div className="p-4 border-b">
                    <h2 className="text-lg font-medium">Order Summary</h2>
                  </div>
                  
                  <div className="p-4">
                    <div className="space-y-2 mb-4">
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Subtotal</span>
                        <span>₹{totalAmount.toFixed(0)}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Delivery Fee</span>
                        <span>₹40</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Tax</span>
                        <span>₹{(totalAmount * 0.05).toFixed(0)}</span>
                      </div>
                    </div>
                    
                    <div className="border-t pt-4 mb-6">
                      <div className="flex justify-between font-medium">
                        <span>Total</span>
                        <span>₹{(totalAmount + 40 + totalAmount * 0.05).toFixed(0)}</span>
                      </div>
                    </div>
                    
                    <Button className="w-full">Proceed to Checkout</Button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </Container>
      </main>
      <Footer />
    </>
  );
}
