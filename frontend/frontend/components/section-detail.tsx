"use client"

import { useEffect, useState } from "react"
import axios from "axios"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { ArrowLeft, Plus, Minus, Info, Trash2 } from "lucide-react"
import { AddItemModal } from "@/components/add-item-modal"
import { useRole } from "@/context/RoleContext"

interface Section {
  id: string
  name: string
  description: string
  itemCount: number
}

interface Item {
  itemId: string
  itemname: string
  availableCount: number
  quantity: number
}

interface SectionDetailProps {
  section: Section
  onBack: () => void
  onDeleteSection: (sectionId: string) => void
  onUpdateSection: (section: Section) => void
}

export function SectionDetail({
  section,
  onBack,
  onDeleteSection,
  onUpdateSection,
}: SectionDetailProps) {
  const { role } = useRole()
  const [items, setItems] = useState<Item[]>([])
  const [isAddItemModalOpen, setIsAddItemModalOpen] = useState(false)
  const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL

  useEffect(() => {
    axios
      .get(`${baseUrl}/api/items/section/${section.id}`)
      .then((res) => {
        const fetched = res.data.map((item: any) => ({ ...item, quantity: 1 }))
        setItems(fetched)
      })
      .catch((err) => console.error(err))
  }, [section.id])

  const updateQuantity = (itemId: string, multiplier: 1 | -1) => {
    const updatedItems = items.map((item) => {
      if (item.itemId === itemId) {
        const change = multiplier * item.quantity
        const newAvailable = Math.max(0, item.availableCount + change)

        axios
          .put(`${baseUrl}/api/items/section/${section.id}/${itemId}`, {
            itemname: item.itemname,
            availableCount: newAvailable,
          })
          .then((res) => console.log("Updated:", res.data))
          .catch((err) => console.error("Update failed:", err))

        return {
          ...item,
          availableCount: newAvailable,
          quantity: 1,
        }
      }
      return item
    })

    setItems(updatedItems)
  }

  const handleDeleteSection = () => {
    if (confirm(`Are you sure you want to delete "${section.name}"?`)) {
      axios
        .delete(`${baseUrl}/api/sections/${section.id}`)
        .then(() => onDeleteSection(section.id))
    }
  }

  const handleAddItem = (name: string, available: number) => {
    axios
      .post(`${baseUrl}/api/items/section/${section.id}`, {
        itemname: name,
        availableCount: available,
      })
      .then((res) => {
        const newItem: Item = { ...res.data, quantity: 1 }
        const updatedItems = [...items, newItem]
        setItems(updatedItems)
        onUpdateSection({ ...section, itemCount: updatedItems.length })
        setIsAddItemModalOpen(false)
      })
  }

  const deleteItem = (itemId: string) => {
    axios
      .delete(`${baseUrl}/api/items/section/${section.id}/${itemId}`)
      .then(() => {
        const updatedItems = items.filter((item) => item.itemId !== itemId)
        setItems(updatedItems)
        onUpdateSection({ ...section, itemCount: updatedItems.length })
      })
  }

  const handleQuantityChange = (itemId: string, value: string) => {
    const parsed = parseInt(value)
    const newQuantity = isNaN(parsed) || parsed < 0 ? 0 : parsed

    setItems((prevItems) =>
      prevItems.map((item) =>
        item.itemId === itemId ? { ...item, quantity: newQuantity } : item
      )
    )
  }

  return (
    <div className="min-h-screen bg-slate-900 text-white p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={onBack}
              className="text-slate-400 hover:text-white"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-2xl font-bold">{section.name}</h1>
              <p className="text-slate-400">{section.description}</p>
            </div>
          </div>

          {role !== "user" && (
            <div className="flex gap-3">
              <Button
                variant="destructive"
                className="bg-red-600 hover:bg-red-700"
                onClick={handleDeleteSection}
              >
                Delete Section
              </Button>
              <Button
                className="bg-blue-600 hover:bg-blue-700"
                onClick={() => setIsAddItemModalOpen(true)}
              >
                Add Item
              </Button>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {items.map((item) => (
            <Card key={item.itemId} className="bg-slate-800 border-slate-700">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">{item.itemname}</CardTitle>
                <p className="text-slate-400 text-sm">Available: {item.availableCount}</p>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {role !== "user" && (
                      <>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => updateQuantity(item.itemId, -1)}
                          className="h-8 w-8 text-slate-400 hover:text-white hover:bg-slate-700"
                        >
                          <Minus className="h-4 w-4" />
                        </Button>
                        <Input
                          type="number"
                          value={item.quantity}
                          onChange={(e) =>
                            handleQuantityChange(item.itemId, e.target.value)
                          }
                          className="w-16 text-center bg-slate-700 border-slate-600 text-white appearance-none [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
                        />
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => updateQuantity(item.itemId, 1)}
                          className="h-8 w-8 text-green-400 hover:text-green-300 hover:bg-slate-700"
                        >
                          <Plus className="h-4 w-4" />
                        </Button>
                      </>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-slate-400 hover:text-white hover:bg-slate-700"
                    >
                      <Info className="h-4 w-4" />
                    </Button>
                    {role !== "user" && (
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => deleteItem(item.itemId)}
                        className="h-8 w-8 text-red-400 hover:text-red-300 hover:bg-slate-700"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {role !== "user" && (
        <AddItemModal
          isOpen={isAddItemModalOpen}
          onClose={() => setIsAddItemModalOpen(false)}
          onSubmit={handleAddItem}
        />
      )}
    </div>
  )
}
