import React from 'react'
import { Link } from 'react-router-dom'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Users, Building, Truck, Plus } from 'lucide-react'

export default function ContactManagement() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Contact Management</h1>
        <p className="text-muted-foreground">
          Manage all your business contacts including brokers, shippers, and consignees
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {/* Brokers */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Brokers</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <CardDescription className="mb-4">
              Manage broker contacts and brokerage companies
            </CardDescription>
            <div className="flex gap-2">
              <Button asChild size="sm">
                <Link to="/contact-management/brokers">
                  View All
                </Link>
              </Button>
              <Button asChild size="sm" variant="outline">
                <Link to="/contact-management/brokers/create">
                  <Plus className="mr-2 h-4 w-4" />
                  Add New
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Shippers */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Shippers</CardTitle>
            <Building className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <CardDescription className="mb-4">
              Manage shipper contacts and company information
            </CardDescription>
            <div className="flex gap-2">
              <Button asChild size="sm">
                <Link to="/contact-management/shippers">
                  View All
                </Link>
              </Button>
              <Button asChild size="sm" variant="outline">
                <Link to="/contact-management/shippers/create">
                  <Plus className="mr-2 h-4 w-4" />
                  Add New
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Consignees */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Consignees</CardTitle>
            <Truck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <CardDescription className="mb-4">
              Manage consignee contacts and delivery locations
            </CardDescription>
            <div className="flex gap-2">
              <Button asChild size="sm">
                <Link to="/contact-management/consignees">
                  View All
                </Link>
              </Button>
              <Button asChild size="sm" variant="outline">
                <Link to="/contact-management/consignees/create">
                  <Plus className="mr-2 h-4 w-4" />
                  Add New
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Stats */}
      {/* <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Brokers</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">-</div>
            <p className="text-xs text-muted-foreground">
              Active broker contacts
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Shippers</CardTitle>
            <Building className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">-</div>
            <p className="text-xs text-muted-foreground">
              Active shipper contacts
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Consignees</CardTitle>
            <Truck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">-</div>
            <p className="text-xs text-muted-foreground">
              Active consignee contacts
            </p>
          </CardContent>
        </Card>
      </div> */}
    </div>
  )
}
