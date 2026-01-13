import { useEffect, useState } from "react";
import ITStaffLayout from "@/components/layout/ITStaffLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Loader2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import api from "@/utils/api";

function Progress() {
    return (
        <ol className="flex items-center gap-2 text-xs mb-4">
            <li className="px-2 py-1 rounded-full bg-blue-600 text-white">1. Select</li>
            <li className="px-2 py-1 rounded-full bg-neutral-200">2. Scan</li>
            <li className="px-2 py-1 rounded-full bg-neutral-200">3. Photo</li>
            <li className="px-2 py-1 rounded-full bg-neutral-200">4. Details</li>
            <li className="px-2 py-1 rounded-full bg-neutral-200">5. Sign</li>
        </ol>
    );
}

export default function SelectEquipment() {
    const navigate = useNavigate();
    const [equipment, setEquipment] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");

    // Fetch ONLY Available equipment
    useEffect(() => {
        const fetchData = async () => {
            try {
                const res = await api.get('/equipment/browse?status=Available');
                setEquipment(res.data);
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    const filtered = equipment.filter(e => 
        e.name.toLowerCase().includes(search.toLowerCase())
    );

    const handleSelect = (item) => {
        // Pass item to next step via router state
        navigate('/it/checkout/scan', { state: { equipment: item } });
    };

    return (
        <ITStaffLayout>
            <div className="p-4 sm:p-6 lg:p-8">
                <h2 className="text-lg font-semibold mb-2">Checkout – Select Equipment</h2>
                <Progress />
                <Card>
                    <CardHeader>
                        <CardTitle>Select items</CardTitle>
                        <CardDescription>Choose available equipment to lend</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="mb-4 max-w-sm">
                            <Input 
                                placeholder="Search by name..." 
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                            />
                        </div>
                        {loading ? (
                             <div className="flex justify-center py-8"><Loader2 className="animate-spin" /></div>
                        ) : (
                            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                                {filtered.map((e) => (
                                    <Card key={e._id} className="hover:border-blue-500 transition-colors">
                                        <CardContent className="p-4 space-y-2">
                                            <div className="font-bold text-lg">{e.name}</div>
                                            <div className="text-xs font-mono text-gray-500">SN: {e.serialNumber}</div>
                                            <Badge className="bg-green-100 text-green-700 hover:bg-green-100">Available</Badge>
                                            <Button className="w-full mt-2" onClick={() => handleSelect(e)}>
                                                Select
                                            </Button>
                                        </CardContent>
                                    </Card>
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </ITStaffLayout>
    );
}