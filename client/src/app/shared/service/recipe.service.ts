import { Injectable } from '@angular/core';
import { ApiService } from './api.service';
import { Observable, of, BehaviorSubject, Subject } from 'rxjs';
@Injectable({ providedIn: 'root' })
export class RecipeService {
    public menus: any = new BehaviorSubject([]);
    public refreshStats: any = new Subject();
    public isReadOnly: boolean = false;
    public stocksData: any;
    public dtOptions: any = {
      pagingType: 'full_numbers',
      lengthMenu: [[200, 500, 1000, 2000, 10000, 20000, -1], [200, 500, 1000, 2000, 10000, 20000, "All"]]
    };
    public dtOptionsSmall: any = {
      pagingType: 'full_numbers',
      lengthMenu: [[50, 100, 200, 500, 1000, 2000, 10000, 20000, -1], [50, 100, 200, 500, 1000, 2000, 10000, 20000, "All"]]
    };
    public dtOptionsPrice: any = {
      pagingType: 'full_numbers',
      lengthMenu: [[50, 100, 200, 500, 1000, 2000, 10000, 20000, -1], [50, 100, 200, 500, 1000, 2000, 10000, 20000, "All"]],
      order:[[5, 'desc']]
    };
    constructor(private apiService: ApiService) {}
    setMenus(menusList: any): void {
        if(menusList && menusList.length > 0) {
            this.menus.next(menusList);
        }
    }
    setReadOnly(readOnly: any): any {
        this.isReadOnly = readOnly;
    }
    getCacheMenus(): any {
        return this.menus.getValue();
    }
    getMenus(): Observable<any> {
        return this.apiService.httpPost('/menus', null);
    }
    login(request: any): Observable<any> {
        return this.apiService.httpPost('/login', request);
    }
    orders(request: any, currentPage: any): Observable<any> {
      let url: any = currentPage ? '/orders?page=' + currentPage : '/orders';
      return this.apiService.httpPost(url, request);
    }
    order(request: any): Observable<any> {
      return this.apiService.httpPostFileJson('/order', request);
    }
    saveAttachment(request: any): Observable<any> {
      return this.apiService.httpPostFileJson('/saveAttachment', request);
    }
    getIncomingStocksPayments(request: any, currentPage: any): Observable<any> {
      let url: any = currentPage ? '/getIncomingStocksPayments?page=' + currentPage : '/getIncomingStocksPayments';
      return this.apiService.httpPost(url, request);
    }
    getIncomingStocksPaymentDetails(request: any): Observable<any> {
      return this.apiService.httpPost('/getIncomingStocksPaymentDetails', request);
    }
    getPaymentModeTypes(): Observable<any> {
      return this.apiService.httpPost('/paymentModeTypes', null);
    }
    saveIncomingStocksPaymentDetail(request: any): Observable<any> {
      return this.apiService.httpPost('/saveIncomingStocksPaymentDetail', request);
    }
    deleteIncomingStocksPaymentDetail(request: any): Observable<any> {
      return this.apiService.httpPost('/deleteIncomingStocksPaymentDetail', request);
    }
    deleteAttachment(request: any): Observable<any> {
      return this.apiService.httpPost('/deleteAttachment', request);
    }
    customers(request: any, currentPage: any): Observable<any> {
      let url: any = currentPage ? '/customers?page=' + currentPage : '/customers';
      return this.apiService.httpPost(url, request);
    }
    saveCustomer(request: any): Observable<any> {
      return this.apiService.httpPost('/customerDetail', request);
    }
    getValidateMloyalCustomerPoints(request: any): Observable<any> {
      return this.apiService.httpPost('/validateMloyalCustomerPoints', request);
    }
    testOtp(request: any): Observable<any> {
      return this.apiService.httpPost('/testOtp', request);
    }
    getSales(request: any): Observable<any> {
        return this.apiService.httpPost('/sales', request);
    }
    getFulfilmentReport(request: any): Observable<any> {
      return this.apiService.httpPost('/fulfilmentReport', request);
    }
    getProductList(): Observable<any> {
        let url: any = '/productList';
        return this.apiService.httpPost(url, null);
    }
    getBrands(request: any, currentPage: any): Observable<any> {
        let url: any = currentPage ? '/brands?page=' + currentPage : '/brands';
        return this.apiService.httpPost(url, request);
    }
    saveBrand(request: any): Observable<any> {
        return this.apiService.httpPost('/brand', request);
    }
    getTranslations(request: any): Observable<any> {
        return this.apiService.httpPost('/translations', request);
    }
    saveTranslation(request: any): Observable<any> {
        return this.apiService.httpPost('/translation', request);
    }
    getLanguages(request: any): Observable<any> {
        return this.apiService.httpPost('/languages', request);
    }
    getCustomer(request: any): Observable<any> {
      return this.apiService.httpPost('/customer', request);
    }
    getCustomers(request: any, currentPage: any): Observable<any> {
      let url: any = currentPage ? '/customers?page=' + currentPage : '/customers';
      return this.apiService.httpPost(url, request);
    }
    getVendors(request: any, currentPage: any): Observable<any> {
      let url: any = currentPage ? '/vendors?page=' + currentPage : '/vendors';
      return this.apiService.httpPost(url, request);
    }
    saveVendor(request: any): Observable<any> {
        return this.apiService.httpPost('/vendor', request);
    }
    getDrivers(request: any, currentPage: any): Observable<any> {
        let url: any = currentPage ? '/drivers?page=' + currentPage : '/drivers';
        return this.apiService.httpPost(url, request);
    }
    saveDriver(request: any): Observable<any> {
        return this.apiService.httpPost('/driver', request);
    }
    getLocations(request: any, currentPage: any): Observable<any> {
        let url: any = currentPage ? '/locations?page=' + currentPage : '/locations';
        return this.apiService.httpPost(url, request);
    }
    getMissingOrder(request: any): Observable<any> {
      return this.apiService.httpPost('/missingOrder', request);
    }
    saveLocation(request: any): Observable<any> {
        return this.apiService.httpPost('/location', request);
    }
    changePassword(request: any): Observable<any> {
      return this.apiService.httpPost('/change-password', request);
    }
    settings(request: any): Observable<any> {
      return this.apiService.httpPost('/settings', request);
    }
    setting(request: any): Observable<any> {
      return this.apiService.httpPost('/setting', request);
    }
    getMenuLocations(request: any, currentPage: any): Observable<any> {
      let url: any = currentPage ? '/menu-locations?page=' + currentPage : '/menu-locations';
      return this.apiService.httpPost(url, request);
    }
    saveMenuLocations(request: any): Observable<any> {
      return this.apiService.httpPostFile('/menu-location', request);
    }
    getProducts(request: any, currentPage: any): Observable<any> {
        let url: any = currentPage ? '/products?page=' + currentPage : '/products';
        return this.apiService.httpPost(url, request);
    }
    saveProduct(request: any): Observable<any> {
        return this.apiService.httpPost('/product', request);
    }
    getProductInStocks(): Observable<any> {
        return this.apiService.httpPost('/productInStocks', null);
    }
    getStocksOutgoings(request: any, currentPage: any): Observable<any> {
        let url: any = currentPage ? '/stocksOutgoings?page=' + currentPage : '/stocksOutgoings';
        return this.apiService.httpPost(url, request);
    }
    saveStocksOutgoing(request: any): Observable<any> {
        return this.apiService.httpPost('/stocksOutgoing', request);
    }
    getUsers(request: any, currentPage: any): Observable<any> {
        let url: any = currentPage ? '/users?page=' + currentPage : '/users';
        return this.apiService.httpPost(url, request);
    }
    ticketDetailUpdate(request: any): Observable<any> {
      return this.apiService.httpPostFile('/ticketDetailUpdate', request);
    }
    saveUser(request: any): Observable<any> {
        let url: any = '/user';
        return this.apiService.httpPost(url, request);
    }
    getRoles(request: any): Observable<any> {
        let url: any ='/roles';
        return this.apiService.httpPost(url, request);
    }
    getUserAccess(request: any, currentPage: any): Observable<any> {
        let url: any = currentPage ? '/user-access?page=' + currentPage : '/user-access';
        return this.apiService.httpPost(url, request);
    }
    getTicketStatus() {
      return this.apiService.httpPost('/ticketStatus', null);
    }
    saveUserAccess(request: any): Observable<any> {
        let url: any = '/stocksOutlet';
        return this.apiService.httpPost(url, request);
    }
    getRoleDetail(request: any): Observable<any> {
        let url: any = '/roleDetail';
        return this.apiService.httpPost(url, request);
    }
    getMenuDetail(): Observable<any> {
        let url: any = '/menuDetail';
        return this.apiService.httpPost(url, null);
    }
    getStocksDetails(request: any) : Observable<any> {
        let url: any = '/stocksIncomingDetail';
        return this.apiService.httpPost(url, request);
    }
    getOutgoingStocksDetails(request: any) : Observable<any> {
        let url: any = '/outgoingStocksDetails';
        return this.apiService.httpPost(url, request);
    }
    saveRole(request: any): Observable<any> {
        let url: any = '/menuDetails';
        return this.apiService.httpPost(url, request);
    }
    getStocksOutlets(request: any): Observable<any> {
        let url: any = '/stocksOutlets?location_id=' + request.location_id;
        return this.apiService.httpPost(url, request);
    }
    saveStocksOutlets(request: any): Observable<any> {
        let url: any = '/stocksOutlet';
        return this.apiService.httpPost(url, request);
    }
    getStocksIncomings(request: any, currentPage: any): Observable<any> {
        let url: any = currentPage ? '/stocksIncomings?page=' + currentPage : '/stocksIncomings';
        return this.apiService.httpPost(url, request);
    }
    saveStocksIncoming(request: any): Observable<any> {
        return this.apiService.httpPostFile('/stocksIncoming', request);
    }
    deleteStocksIncoming(request: any): Observable<any> {
        return this.apiService.httpPost('/deleteStocksIncoming', request);
    }
    getCategories(request: any, currentPage: any): Observable<any> {
        let url: any = currentPage ? '/categories?page=' + currentPage : '/categories';
        return this.apiService.httpPost(url, request);
    }
    getProductsByCategory(): Observable<any> {
      return this.apiService.httpGet('/productsByCategory');
    }
    getMyLocationDetail(): Observable<any> {
      return this.apiService.httpPost('/findMyLocationDetail', null);
    }
    getSubcategories(request: any, currentPage: any): Observable<any> {
        let url: any = currentPage ? '/sub-categories?page=' + currentPage : '/sub-categories';
        return this.apiService.httpPost(url, request);
    }
    wastageStock(request: any): Observable<any> {
      return this.apiService.httpPost('/wastage-stock', request);
    }
    saveSubcategory(request: any): Observable<any> {
        return this.apiService.httpPost('/sub-category', request);
    }
    getResMenus(request: any, currentPage: any): Observable<any> {
        let url: any = currentPage ? '/hotel-menus?page=' + currentPage : '/hotel-menus';
        return this.apiService.httpPost(url, request);
    }
    saveResMenus(request: any): Observable<any> {
        return this.apiService.httpPost('/hotel-menu', request);
    }
    getDailyMenus(request: any): Observable<any> {
        return this.apiService.httpPost('/daily-menus', request);
    }
    getDailyMenu(request: any): Observable<any> {
        return this.apiService.httpPost('/daily-menu', request);
    }
    saveDailyMenu(request: any): Observable<any> {
        return this.apiService.httpPost('/menu-daily', request);
    }
    priceAlerts(): Observable<any> {
        return this.apiService.httpPost('/priceAlerts', null);
    }
    removePriceAlerts(request: any): Observable<any> {
        return this.apiService.httpPost('/deleteAlertPrice', request);
    }
    getProductPriceHistory(request: any): Observable<any> {
        return this.apiService.httpPost('/productPriceHistory', request);
    }
    saveCategory(request: any): Observable<any> {
        return this.apiService.httpPost('/category', request);
    }
    getUnits(): Observable<any> {
        return this.apiService.httpGet('/units');
    }
    getRecipes(request: any, currentPage: any): Observable<any> {
        let url: any = currentPage ? '/recipes?page=' + currentPage : '/recipes';
        return this.apiService.httpPost(url, request);
    }
    getRecipeById(request: any): Observable<any> {
        return this.apiService.httpPost('/recipeById', request);
    }
    getDisableOnlineRecipes(request: any): Observable<any> {
      return this.apiService.httpPost('/disableOnlineRecipes', null);
    }
    saveDisableOnlineRecipes(request: any): Observable<any> {
      return this.apiService.httpPost('/saveDisableOnlineRecipes', request);
    }
    saveRecipes(request: any): Observable<any> {
        return this.apiService.httpPost('/recipe', request);
    }
    manufacturingPrice(request: any): Observable<any> {
      let url: any = '/manufacturingPrice?recipeId=' + request.id;
      return this.apiService.httpGet(url);
    }
    jobs(): Observable<any> {
      return this.apiService.httpGet('/jobs');
    }
    requestLocations(request: any): Observable<any> {
      return this.apiService.httpPost('/requestLocations', request);
    }
    job(url: any): Observable<any> {
      return this.apiService.httpGet(url);
    }
    getCalculateIngredients(request: any): Observable<any> {
        return this.apiService.httpPost('/calculateIngredients', request);
    }
    getStocksOutletHistory(request: any, currentPage: any): Observable<any> {
        let url: any = currentPage ? '/stocksOutletHistory?page=' + currentPage : '/stocksOutletHistory';
        return this.apiService.httpPost(url, request);
    }
    getReports(request: any): Observable<any> {
        return this.apiService.httpPost('/reports', request);
    }
    getRequestOutletStocks(request: any, currentPage: any): Observable<any> {
      let url: any = currentPage ? '/requestOutletStocks?page=' + currentPage : '/requestOutletStocks';
      return this.apiService.httpPost(url, request);
    }
    saveRequestOutletStocks(request: any): Observable<any> {
      return this.apiService.httpPost('/requestOutletStock', request);
    }
    getRequestOutletStocksdetails(request: any): Observable<any> {
      return this.apiService.httpPost('/requestOutletStocksDetail', request);
    }
    rejectRequestOutletStocks(request: any): Observable<any> {
      return this.apiService.httpPost('/rejectRequestOutletStocks', request);
    }
    approveRequestOutletStocks(request: any, currentPage: any): Observable<any> {
      let url: any = currentPage ? '/approveRequestOutletStocks?page=' + currentPage : '/approveRequestOutletStocks';
      return this.apiService.httpPost(url, request);
    }
    saveApproveRequestOutletStocks(request: any): Observable<any> {
      return this.apiService.httpPost('/approveRequestOutletStock', request);
    }
    savePickupRequestOutletStocks(request: any): Observable<any> {
      return this.apiService.httpPost('/pickupRequestOutletStock', request);
    }
    orderStatus(): Observable<any> {
      return this.apiService.httpPost('/orderStatus', null);
    }
    recipeForPos(): Observable<any> {
      return this.apiService.httpPost('/recipeForPos', null);
    }
    recipeForStockRequest(request? : any): Observable<any> {
      return this.apiService.httpPost('/recipeForStockRequest', request);
    }
    locationStock(request: any): Observable<any> {
      return this.apiService.httpPost('/locationStock', request);
    }
    saveInvoice(request: any): Observable<any> {
      return this.apiService.httpPost('/invoice', request);
    }
    returnStocks(request: any): Observable<any> {
      return this.apiService.httpPost('/returnStocks', request);
    }
    todayMenu(request: any): Observable<any> {
      return this.apiService.httpPost('/todayMenu', request);
    }
    cancelBill(request: any): Observable<any> {
      return this.apiService.httpPost('/cancelBill', request);
    }
    acceptRequestOutletStock(request: any): Observable<any> {
      return this.apiService.httpPost('/acceptRequestOutletStock', request);
    }
    getInvoices(request: any, currentPage: any): Observable<any> {
      let url: any = currentPage ? '/invoices?page=' + currentPage : '/invoices';
      return this.apiService.httpPost(url, request);
    }
    getInvoice(request: any): Observable<any> {
      let url: any = '/invoice?invoice_no=' + request.invoice_no + '&location_id=' + request.location_id + '&id=' + request.id;
      return this.apiService.httpGet(url);
    }
    notifyMloyal(): Observable<any> {
      return this.apiService.httpGet('/notifyMloyal');
    }
    dotPeStockOut(): Observable<any> {
      return this.apiService.httpGet('/dotPeStockOut');
    }
    getPaymentModes() {
      return this.apiService.httpPost('/paymentModes', null);
    }
    getCheckBilling(request: any) {
      return this.apiService.httpPost('/checkBilling', request);
    }
    startBilling(request: any) {
      return this.apiService.httpPost('/startBilling', request);
    }
    locationInfo(request: any) {
      return this.apiService.httpPost('/locationInfo', request);
    }
    getCategoriesWithDemcialStep() {
      return this.apiService.httpPost('/categoriesWithDemcialStep', null);
    }
    getTableBillDetail(request: any) {
      return this.apiService.httpPost('/tableBillDetail', request);
    }
    tablePendingOrders(request: any) {
      return this.apiService.httpPost('/tablePendingOrders', request);
    }
    tableUpdatePendingOrder(request: any) {
      return this.apiService.httpPost('/tableUpdatePendingOrder', request);
    }
    previousDayClosing(request: any) {
      let url: any = '/previousDayClosing?location_id=' + request.location_id;
      return this.apiService.httpGet(url);
    }
    shapes(request: any) {
      return this.apiService.httpPost('/shapes', request);
    }
    getCategoriesTicket(request: any, currentPage: any): Observable<any> {
      let url: any = currentPage ? '/categories-ticket?page=' + currentPage : '/categories-ticket';
      return this.apiService.httpPost(url, request);
    }
    getQuestionCategoryDetail(request: any): Observable<any> {
      return this.apiService.httpPost('/questionCategoryDetail', request);
    }
    saveCategoryTicket(request: any): Observable<any> {
        return this.apiService.httpPost('/category-ticket', request);
    }
    getSubcategoriesTicket(request: any, currentPage: any): Observable<any> {
        let url: any = currentPage ? '/sub-categories-ticket?page=' + currentPage : '/sub-categories-ticket';
        return this.apiService.httpPost(url, request);
    }
    saveSubcategoryTicket(request: any): Observable<any> {
        return this.apiService.httpPost('/sub-category-ticket', request);
    }
    getQuestions(request: any, currentPage: any): Observable<any> {
      let url: any = currentPage ? '/questions?page=' + currentPage : '/questions';
      return this.apiService.httpPost(url, request);
    }
    getTickets(request: any, currentPage: any): Observable<any> {
      let url: any = currentPage ? '/tickets?page=' + currentPage : '/tickets';
      return this.apiService.httpPost(url, request);
    }
    getQuestionsTypes(): Observable<any> {
      return this.apiService.httpPost('/questionsTypes', null);
    }
    saveQuestion(request: any): Observable<any> {
        return this.apiService.httpPost('/question', request);
    }
    getTicket(request: any, currentPage: any): Observable<any> {
      let url: any = currentPage ? '/tickets?page=' + currentPage : '/tickets';
      return this.apiService.httpPost(url, request);
    }
    saveTicket(request: any): Observable<any> {
        return this.apiService.httpPostFile('/ticket', request);
    }
    ticketDetail(request: any): Observable<any> {
      return this.apiService.httpPost('/ticketDetail', request);
    }
    stats(request: any): Observable<any> {
      return this.apiService.httpPost('/stats', request);
    }
    checkOldRequestNotAccepted(request: any): Observable<any> {
      return this.apiService.httpPost('/checkOldRequestNotAccepted', request);
    }
    saleAnalytics(request: any): Observable<any> {
      return this.apiService.httpPost('/saleAnalytics', request);
    }
    skuAnalytics(request: any): Observable<any> {
      return this.apiService.httpPost('/skuAnalytics', request);
    }
    importantDishAnalytics(request: any): Observable<any> {
      return this.apiService.httpPost('/importantDishAnalytics', request);
    }
    categoryAnalytics(request: any): Observable<any> {
      return this.apiService.httpPost('/categoryAnalytics', request);
    }
    getBillingItems(request?: any): Observable<any> {
      return this.apiService.httpPost('/billingItems', request);
    }
    getRepeatPurchases(request?: any): Observable<any> {
      return this.apiService.httpPost('/repeatPurchases', request);
    }
    getMembers(request?: any): Observable<any> {
      return this.apiService.httpPost('/members', request);
    }
    getEarnBurn(request?: any): Observable<any> {
      return this.apiService.httpPost('/earnBurn', request);
    }
    getCategoryWiseAnalysis(request?: any): Observable<any> {
      return this.apiService.httpPost('/categoryWiseAnalysis', request);
    }
    dotPeCategorySyn(request?: any): Observable<any> {
      let url: any = '/dotPeCategorySyn?location_id=' + request.location_id;
      return this.apiService.httpGet(url);
    }
    loyaltyDashboard(request?: any): Observable<any> {
      return this.apiService.httpPost('/loyaltyDashboard', request);
    }
    memberDashboard(request?: any, currentPage?: any): Observable<any> {
      let url: any = currentPage ? '/memberDashboard?page=' + currentPage : '/memberDashboard';
      return this.apiService.httpPost(url, request);
    }
}
