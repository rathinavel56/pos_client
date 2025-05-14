import { Routes } from '@angular/router';
import { FullComponent } from './layouts/full/full.component';
import { AuthGuard } from './guard/auth.guard';
export const Approutes: Routes = [
  {
    path: '',
    component: FullComponent,
    children: [
      {
        path: '',
        redirectTo: '/login',
        pathMatch: 'full'
      },
      {
        path: 'login',
        loadChildren: () => import('./login/login.module').then(m => m.LoginModule)
      },
      {
        path: 'dashboard',
        loadChildren: () => import('./dashboard/dashboard.module').then(m => m.DashboardModule),
        canActivate: [AuthGuard]
      },
      {
        path: 'fulfilment-report',
        loadChildren: () => import('./dashboard/dashboard.module').then(m => m.DashboardModule),
        canActivate: [AuthGuard]
      },
      {
        path: 'sale-analytics',
        loadChildren: () => import('./analytics/analytics.module').then(m => m.AnalyticsModule),
        canActivate: [AuthGuard]
      },
      {
        path: 'sku-analytics',
        loadChildren: () => import('./analytics/analytics.module').then(m => m.AnalyticsModule),
        canActivate: [AuthGuard]
      },
      {
        path: 'sold-out-timing',
        loadChildren: () => import('./analytics/analytics.module').then(m => m.AnalyticsModule),
        canActivate: [AuthGuard]
      },
      {
        path: 'category-analytics',
        loadChildren: () => import('./analytics/analytics.module').then(m => m.AnalyticsModule),
        canActivate: [AuthGuard]
      },
      {
        path: 'locations',
        loadChildren: () => import('./location/location.module').then(m => m.LocationModule),
        canActivate: [AuthGuard]
      },
      {
        path: 'location-info',
        loadChildren: () => import('./location-info/location-info.module').then(m => m.LocationInfoModule),
        canActivate: [AuthGuard]
      },
	    {
        path: 'products',
        loadChildren: () => import('./products/products.module').then(m => m.ProductsModule),
        canActivate: [AuthGuard]
      },
      {
        path: 'category',
        loadChildren: () => import('./category/category.module').then(m => m.CategoryModule),
        canActivate: [AuthGuard]
      },
      {
        path: 'sub-category',
        loadChildren: () => import('./sub-category/sub-category.module').then(m => m.SubCategoryModule),
        canActivate: [AuthGuard]
      },
	    {
        path: 'recipes',
        loadChildren: () => import('./recipe/recipe.module').then(m => m.RecipeModule),
        canActivate: [AuthGuard]
      },
      {
        path: 'calculator',
        loadChildren: () => import('./calculator/calculator.module').then(m => m.CalculatorModule),
        canActivate: [AuthGuard]
      },
      {
        path: 'sfgcalculator',
        loadChildren: () => import('./calculator/calculator.module').then(m => m.CalculatorModule),
        canActivate: [AuthGuard]
      },
      {
        path: 'brand',
        loadChildren: () => import('./brand/brand.module').then(m => m.BrandModule),
        canActivate: [AuthGuard]
      },
      {
        path: 'driver',
        loadChildren: () => import('./driver/driver.module').then(m => m.DriverModule),
        canActivate: [AuthGuard]
      },
      {
        path: 'incoming-stocks',
        loadChildren: () => import('./incoming-stocks/incoming-stocks.module').then(m => m.IncomingStocksModule),
        canActivate: [AuthGuard]
      },
      {
        path: 'outlet-stocks',
        loadChildren: () => import('./outlet-stocks/outlet-stocks.module').then(m => m.OutletStocksModule),
        canActivate: [AuthGuard]
      },
      {
        path: 'outlet-stocks-close',
        loadChildren: () => import('./outlet-stocks-close/outlet-stocks-close.module').then(m => m.OutletStocksCloseModule),
        canActivate: [AuthGuard]
      },
      {
        path: 'invoices',
        loadChildren: () => import('./invoice/invoice.module').then(m => m.InvoiceModule),
        canActivate: [AuthGuard]
      },
      {
        path: 'credit-wastage-stocks',
        loadChildren: () => import('./credit-wastage-stocks/credit-wastage-stocks.module').then(m => m.CreditWastageStocksModule),
        canActivate: [AuthGuard]
      },
      {
        path: 'today_menu',
        loadChildren: () => import('./today-menu/today-menu.module').then(m => m.TodayMenuModule),
        canActivate: [AuthGuard]
      },
      {
        path: 'outlet-stocks-history',
        loadChildren: () => import('./outlet-stocks-history/outlet-stocks-history.module').then(m => m.OutletStocksHistoryModule),
        canActivate: [AuthGuard]
      },
      {
        path: 'users',
        loadChildren: () => import('./users/users.module').then(m => m.UsersModule),
        canActivate: [AuthGuard]
      },
      {
        path: 'user-access',
        loadChildren: () => import('./user-access/user-access.module').then(m => m.UserAccessModule),
        canActivate: [AuthGuard]
      },
      {
        path: 'vendor',
        loadChildren: () => import('./vendor/vendor.module').then(m => m.VendorModule),
        canActivate: [AuthGuard]
      },
      {
        path: 'vendor-dashboard',
        loadChildren: () => import('./vendor/vendor.module').then(m => m.VendorModule),
        canActivate: [AuthGuard]
      },
      {
        path: 'price-alert',
        loadChildren: () => import('./price-alert/price-alert.module').then(m => m.PriceAlertModule),
        canActivate: [AuthGuard]
      },
      {
        path: 'reports',
        loadChildren: () => import('./reports/reports.module').then(m => m.ReportsModule),
        canActivate: [AuthGuard]
      },
      {
        path: 'location-menu',
        loadChildren: () => import('./location-menu/location-menu.module').then(m => m.LocationMenuModule),
        canActivate: [AuthGuard]
      },
      {
        path: 'menus',
        loadChildren: () => import('./menus/menus.module').then(m => m.MenusModule),
        canActivate: [AuthGuard]
      },
      {
        path: 'menu',
        loadChildren: () => import('./menu/menu.module').then(m => m.MenuModule),
        canActivate: [AuthGuard]
      },
      {
        path: 'menu-locations',
        loadChildren: () => import('./menu-location/menu-location.module').then(m => m.MenuLocationModule),
        canActivate: [AuthGuard]
      },
      {
        path: 'billing',
        loadChildren: () => import('./billing/billing.module').then(m => m.BillingModule),
        canActivate: [AuthGuard]
      },
      {
        path: 'request-outlet-stocks',
        loadChildren: () => import('./request-outlet-stocks/request-outlet-stocks.module').then(m => m.RequestOutletStocksModule),
        canActivate: [AuthGuard]
      },
      {
        path: 'kitchen',
        loadChildren: () => import('./kitchen/kitchen.module').then(m => m.KitchenModule),
        canActivate: [AuthGuard]
      },
      {
        path: 'approve-outlet-stocks',
        loadChildren: () => import('./approve-outlet-stocks/approve-outlet-stocks.module').then(m => m.ApproveOutletStocksModule),
        canActivate: [AuthGuard]
      },
      {
        path: 'pickup-outlet-stocks',
        loadChildren: () => import('./pickup-outlet-stocks/pickup-outlet-stocks.module').then(m => m.PickupOutletStocksModule),
        canActivate: [AuthGuard]
      },
      {
        path: 'orders',
        loadChildren: () => import('./orders/orders.module').then(m => m.OrderModule),
        canActivate: [AuthGuard]
      },
      {
        path: 'dashboard-ticket',
        loadChildren: () => import('./support/dashboard-ticket/dashboard-ticket.module').then(m => m.DashboardTicketModule),
        canActivate: [AuthGuard]
      },
      {
        path: 'category-ticket',
        loadChildren: () => import('./support/category-ticket/category-ticket.module').then(m => m.CategoryTicketModule),
        canActivate: [AuthGuard]
      },
      {
        path: 'questions-ticket',
        loadChildren: () => import('./support/questions-ticket/questions-ticket.module').then(m => m.QuestionsTicketModule),
        canActivate: [AuthGuard]
      },
      {
        path: 'ticket',
        loadChildren: () => import('./support/ticket/ticket.module').then(m => m.TicketModule),
        canActivate: [AuthGuard]
      },
      {
        path: 'change-password',
        loadChildren: () => import('./password/password.module').then(m => m.PasswordModule),
        canActivate: [AuthGuard]
      },
      {
        path: 'business-settings',
        loadChildren: () => import('./settings/settings.module').then(m => m.SettingsModule),
        canActivate: [AuthGuard]
      },
      {
        path: 'developer-settings',
        loadChildren: () => import('./settings/settings.module').then(m => m.SettingsModule),
        canActivate: [AuthGuard]
      },
      {
        path: 'repeat-purchases',
        loadChildren: () => import('./loyalty/loyalty.module').then(m => m.LoyaltyModule),
        canActivate: [AuthGuard]
      },
      {
        path: 'members',
        loadChildren: () => import('./loyalty/loyalty.module').then(m => m.LoyaltyModule),
        canActivate: [AuthGuard]
      },
      {
        path: 'earn-burn',
        loadChildren: () => import('./loyalty-dashboard/loyalty-dashboard.module').then(m => m.LoyaltyDashboardModule),
        canActivate: [AuthGuard]
      },
      {
        path: 'category-wise-analysis',
        loadChildren: () => import('./loyalty/loyalty.module').then(m => m.LoyaltyModule),
        canActivate: [AuthGuard]
      },
      {
        path: 'jobs',
        loadChildren: () => import('./jobs/jobs.module').then(m => m.JobModule),
        canActivate: [AuthGuard]
      },
      {
        path: 'loyalty-dashboard',
        loadChildren: () => import('./loyalty-dashboard/loyalty-dashboard.module').then(m => m.LoyaltyDashboardModule),
        canActivate: [AuthGuard]
      },
      {
        path: 'member-dashboard',
        loadChildren: () => import('./member-dashboard/member-dashboard.module').then(m => m.MemberDashboardModule),
        canActivate: [AuthGuard]
      },
      {
        path: 'disable-item-in-online-order',
        loadChildren: () => import('./disable-item-in-online-order/disable-item-in-online-order.module').then(m => m.DisableItemInOnlineOrderModule),
        canActivate: [AuthGuard]
      }
    ]
  },
  {
    path: '**',
    redirectTo: '/login'
  }
];
