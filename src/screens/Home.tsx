import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Dimensions, Image } from 'react-native';
import { BarChart, PieChart } from 'react-native-chart-kit';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useTranslation } from 'react-i18next';
import { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import { MainTabParamList } from '../navigation/types';
import apiService from '../services/api';
import { useAuth } from '../context/AuthContext';
import { RegularText, TitleText } from '../components/CustomText';
import Card from '../components/Card';
import Dropdown from '../components/Dropdown';
import DatePicker from '../components/DatePicker';
import Svg, { Path } from 'react-native-svg';
import colors, { hexToRgba } from '../constants/colors';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

type HomeScreenNavigationProp = NativeStackNavigationProp<MainTabParamList, 'Home'>;

const Home = () => {
  const { width } = Dimensions.get('window');
  const navigation = useNavigation<BottomTabNavigationProp<MainTabParamList>>();
  const { t } = useTranslation();
  const { accessToken, isAuthenticated, userInfo: ctxUser } = useAuth();
  const [shopStats, setShopStats] = useState<any>(null);
  const [userInfo, setUserInfo] = useState<any>(null);
  const [userProfile, setUserProfile] = useState<any>(null);
  const [currentShopId, setCurrentShopId] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(false);
  const [orders, setOrders] = useState<any[]>([]);
  const [barRange, setBarRange] = useState<string>('one_week');
  const [pieRange, setPieRange] = useState<string>('one_week');
  const [customStart, setCustomStart] = useState<Date>(new Date(Date.now() - 6 * 24 * 60 * 60 * 1000));
  const [customEnd, setCustomEnd] = useState<Date>(new Date());

  // Shared range options
  const RANGE_OPTIONS = [
    { label: t('dates.today'), value: 'today' },
    { label: t('dates.yesterday'), value: 'yesterday' },
    { label: t('dates.last_week'), value: 'one_week' },
    { label: t('dates.last_month'), value: 'one_month' },
    { label: t('dates.last_6_months'), value: 'three_months' },
    { label: t('dates.custom'), value: 'custom' },
  ];

  // Carousel setup
  const slides = [
    require('../assets/images/pexels-1.jpg'),
    require('../assets/images/pexels-2.jpg'),
    require('../assets/images/pexels-3.jpg'),
    require('../assets/images/pexels-4.jpg'), // repeat to make 4 slides
  ];
  const [carouselIndex, setCarouselIndex] = useState(0);
  const carouselRef = useRef<ScrollView>(null);
  const slideWidth = width - 40; // wide with small margins
  const slideGap = 12;
  const slideHeight = 150; // slightly increased height
  const snapWidth = slideWidth + slideGap; // account for gap

  // Auto-advance carousel every 1 second
  useEffect(() => {
    if (slides.length <= 1) return;
    const timerId = setInterval(() => {
      setCarouselIndex((prev) => {
        const next = (prev + 1) % slides.length;
        const x = next * snapWidth;
        carouselRef.current?.scrollTo({ x, animated: true });
        return next;
      });
    }, 2500);
    return () => clearInterval(timerId);
  }, [slides.length, snapWidth]);

  const displayName = (userProfile?.name && userProfile.name.trim()) || (ctxUser?.name && ctxUser.name.trim()) || (userInfo?.name && userInfo.name.trim()) || 'User';
  const userInitial = displayName?.trim()?.charAt(0)?.toUpperCase?.() || 'U';

  const getISTGreeting = (): string => {
    const now = new Date();
    const utcMs = now.getTime() + now.getTimezoneOffset() * 60000;
    const istMs = utcMs + 330 * 60000; // IST = UTC + 5:30 => 330 minutes
    const istHour = new Date(istMs).getHours();
    if (istHour < 12) return t('home.good_morning');
    if (istHour < 17) return t('home.good_afternoon');
    return t('home.good_evening');
  };

  // Derived stats for sections (prefer backend-provided values)
  const activeTailors = shopStats?.totalActiveTailors ?? 0;
  const totalTailors = shopStats?.totalTailors ?? 0;
  const inactiveTailors = shopStats?.inactiveTailors ?? Math.max(0, totalTailors - activeTailors);

  const activeCustomers = shopStats?.inProgressCustomers ?? 0; // Customers with IN_PROGRESS orders
  const deliveredCustomers = shopStats?.deliveredCustomers ?? 0; // Customers with DELIVERED orders
  const pendingCustomers = shopStats?.pendingCustomers ?? 0; // Customers with PENDING orders
  const totalCustomers = shopStats?.totalCustomers ?? 0;

  // Range helpers for charts
  const getRangeDates = (which: 'bar' | 'pie'): { start: Date; end: Date } => {
    let end = new Date();
    let start = new Date();
    const active = which === 'bar' ? barRange : pieRange;
    switch (active) {
      case 'today': {
        start = new Date();
        start.setHours(0, 0, 0, 0);
        end.setHours(23, 59, 59, 999);
        break;
      }
      case 'yesterday': {
        const today = new Date();
        const y = new Date();
        y.setDate(y.getDate() - 1);
        // For bar: show two bars (yesterday & today) so expand end to today
        if (which === 'bar') {
          start = new Date(y);
          start.setHours(0, 0, 0, 0);
          const e = new Date(today);
          e.setHours(23, 59, 59, 999);
          return { start, end: e };
        } else {
          start = new Date(y);
          start.setHours(0, 0, 0, 0);
          const e = new Date(y);
          e.setHours(23, 59, 59, 999);
          return { start, end: e };
        }
      }
      case 'one_week': {
        start = new Date();
        start.setDate(end.getDate() - 6);
        start.setHours(0, 0, 0, 0);
        end.setHours(23, 59, 59, 999);
        break;
      }
      case 'one_month': {
        // For "last month", we want to show the previous calendar month
        const now = new Date();
        const currentMonth = now.getMonth();
        const currentYear = now.getFullYear();
        
        // Go to previous month
        if (currentMonth === 0) {
          // January - go to December of previous year
          start = new Date(currentYear - 1, 11, 1);
        } else {
          start = new Date(currentYear, currentMonth - 1, 1);
        }
        
        // End of previous month
        if (currentMonth === 0) {
          end = new Date(currentYear - 1, 11, 31);
        } else {
          end = new Date(currentYear, currentMonth, 0); // Last day of previous month
        }
        
        start.setHours(0, 0, 0, 0);
        end.setHours(23, 59, 59, 999);
        console.log('[Home] One month range calculated:', { start: start.toISOString(), end: end.toISOString() });
        break;
      }
      case 'three_months': {
        start = new Date();
        start.setMonth(start.getMonth() - 3);
        start.setHours(0, 0, 0, 0);
        end.setHours(23, 59, 59, 999);
        break;
      }
      case 'custom':
        return { start: customStart, end: customEnd };
      default: {
        start = new Date();
        start.setDate(end.getDate() - 6);
        start.setHours(0, 0, 0, 0);
        end.setHours(23, 59, 59, 999);
      }
    }
    return { start, end };
  };

  const withinRange = (dateStr?: string, which: 'bar' | 'pie' = 'bar'): boolean => {
    if (!dateStr) return false;
    const d = new Date(dateStr);
    const { start, end } = getRangeDates(which);
    return d >= new Date(new Date(start).setHours(0,0,0,0)) && d <= new Date(new Date(end).setHours(23,59,59,999));
  };

  // Build bar data from payments grouped per day (server-driven)
  const dailyEarningsMap: Record<string, number> = {};
  const dailyOrdersMap: Record<string, number> = {}; // Track order counts per day
  (orders || []).forEach(() => {}); // keep orders var used; will use payments instead
  const [payments, setPayments] = useState<any[]>([]);
  const refreshPayments = async (explicitShopId?: string | null) => {
    try {
      const shopIdToUse = explicitShopId ?? currentShopId ?? userInfo?.shopId ?? shopStats?.id ?? null;
      if (!shopIdToUse) {
        console.warn('[Home] refreshPayments: No shopId available yet');
        return;
      }
      const { start, end } = getRangeDates('bar');
      const startIso = new Date(new Date(start).setHours(0,0,0,0)).toISOString();
      const endIso = new Date(new Date(end).setHours(23,59,59,999)).toISOString();
      console.log('[Home] Fetching payments by range (bar filter):', { filter: barRange, shopId: shopIdToUse, startIso, endIso });
      const res = await apiService.getPaymentsByRange(shopIdToUse, startIso, endIso);
      console.log('[Home] Payments response:', res);
      console.log('[Home] Payments synced created:', (res as any)?.syncedCreated, 'updated:', (res as any)?.syncedUpdated, 'total:', (res as any)?.total);
      console.log('[Home] Payments count:', Array.isArray((res as any)?.payments) ? (res as any).payments.length : 'invalid');
      console.log('[Home] Payments sample:', Array.isArray((res as any)?.payments) ? (res as any).payments.slice(0, 3) : (res as any));
      const list = Array.isArray((res as any).payments) ? (res as any).payments : [];
      setPayments(list);
    } catch (err) {
      console.error('[Home] Failed to fetch payments:', err);
      setPayments([]);
    }
  };
  useEffect(() => { refreshPayments(); /* eslint-disable-line react-hooks/exhaustive-deps */ }, [barRange, customStart, customEnd, currentShopId]);
  // Prepare bucketing helpers
  const barRangeActive = barRange;
  const { start: barStartDate, end: barEndDate } = getRangeDates('bar');
  const startLocal = new Date(new Date(barStartDate).setHours(0, 0, 0, 0));
  const endLocal = new Date(new Date(barEndDate).setHours(23, 59, 59, 999));
  
  console.log('[Home] Bar chart date range:', { 
    barRange, 
    startLocal: startLocal.toISOString(), 
    endLocal: endLocal.toISOString(),
    totalOrders: orders?.length || 0
  });
  const addToBucket = (key: string, amount: number) => {
    dailyEarningsMap[key] = (dailyEarningsMap[key] || 0) + amount;
  };
  const addOrderToBucket = (key: string) => {
    dailyOrdersMap[key] = (dailyOrdersMap[key] || 0) + 1;
  };
  const pad2 = (n: number) => String(n).padStart(2, '0');
  const localDayKey = (d: Date) => `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`;

  // First, add order creation data to the chart (so new orders show up immediately)
  console.log('[Home] Processing orders for bar chart:', orders?.length || 0);
  
  (orders || []).forEach((o: any) => {
    const dateSource = o.orderDate || o.createdAt;
    if (!dateSource) {
      console.log(`[Home] Order ${o.id} has no date source`);
      return;
    }
    
    console.log(`[Home] Processing order ${o.id}:`, { 
      orderDate: o.orderDate, 
      createdAt: o.createdAt, 
      dateSource,
      status: o.status,
      totalAmount: o.totalAmount,
      materialCost: o.clothes?.[0]?.materialCost
    });
    
    const dt = new Date(dateSource);
    if (isNaN(dt.getTime())) {
      console.log(`[Home] Order ${o.id} has invalid date: ${dateSource}`);
      return;
    }
    
    // Check if order is within the selected date range for the bar chart
    if (dt < startLocal || dt > endLocal) {
      console.log(`[Home] Order ${o.id} date ${dt.toISOString()} is outside range ${startLocal.toISOString()} to ${endLocal.toISOString()}`);
      return;
    }
    
    // Get the order amount - prioritize totalAmount, then materialCost from clothes
    let orderAmount = 0;
    if (o.totalAmount && typeof o.totalAmount === 'number') {
      orderAmount = o.totalAmount;
    } else if (o.clothes && o.clothes.length > 0) {
      // Sum up material costs from all clothes in the order
      orderAmount = o.clothes.reduce((sum: number, cloth: any) => {
        return sum + (cloth.materialCost || 0);
      }, 0);
    }
    
    console.log(`[Home] Order ${o.id} amount: ${orderAmount}`);
    
    // Add order amount to the chart based on the date range filter
    let key: string;
    
    if (barRangeActive === 'today') {
      key = localDayKey(dt);
    } else if (barRangeActive === 'yesterday') {
      key = dt.toISOString().slice(0, 10);
    } else if (barRangeActive === 'three_months') {
      key = `${dt.getFullYear()}-${String(dt.getMonth() + 1).padStart(2, '0')}`;
    } else {
      // For one_week, one_month, custom, and default cases
      key = localDayKey(dt);
    }
    
    // Add the actual order amount to earnings
    if (orderAmount > 0) {
      addToBucket(key, orderAmount);
      console.log(`[Home] Added order amount ${orderAmount} to earnings bucket: ${key}, date: ${dateSource}, orderId: ${o.id}`);
    }
    
    // Also add order count for reference
    addOrderToBucket(key);
    console.log(`[Home] Added order count to bucket: ${key}, date: ${dateSource}, orderId: ${o.id}`);
  });
  
  console.log('[Home] Order buckets created:', dailyOrdersMap);
  console.log('[Home] Payment buckets created:', dailyEarningsMap);

  // Ingest payments into buckets per filter
  payments.forEach((p: any) => {
    if (!p?.paidAt) return;
    const dt = new Date(p.paidAt);
    if (dt < startLocal || dt > endLocal) return;
    const amount = typeof p.amount === 'number' ? p.amount : Number(p.amount) || 0;

    if (barRangeActive === 'today') {
      const key = localDayKey(dt); // single daily bucket for today
      addToBucket(key, amount);
    } else if (barRangeActive === 'yesterday') {
      const key = dt.toISOString().slice(0, 10);
      addToBucket(key, amount);
    } else if (barRangeActive === 'one_week' || barRangeActive === 'one_month' || barRangeActive === 'custom') {
      const key = localDayKey(dt);
      addToBucket(key, amount);
    } else if (barRangeActive === 'three_months') {
      const key = `${dt.getFullYear()}-${String(dt.getMonth() + 1).padStart(2, '0')}`; // YYYY-MM
      addToBucket(key, amount);
    } else {
      const key = localDayKey(dt);
      addToBucket(key, amount);
    }
  });
  
  // Combine order amounts with payment amounts for the bar chart
  // Priority: Use order amounts first (for exact earnings), then payments as fallback
  const combinedDataMap: Record<string, number> = {};
  const allKeys = new Set([...Object.keys(dailyEarningsMap), ...Object.keys(dailyOrdersMap)]);
  
  allKeys.forEach(key => {
    const paymentAmount = dailyEarningsMap[key] || 0;
    const orderCount = dailyOrdersMap[key] || 0;
    
    // Priority: Use order amounts (from dailyEarningsMap) first for exact earnings
    // If no order amounts, use payment amounts as fallback
    if (paymentAmount > 0) {
      combinedDataMap[key] = paymentAmount;
    } else if (orderCount > 0) {
      // If no amounts but we have orders, show 0 (don't scale order count)
      combinedDataMap[key] = 0;
    }
  });
  
  console.log('[Home] Combined data map:', combinedDataMap);

  // Note: Order amounts are already processed above, no need for additional fallback logic
  // Compute display labels/data per filter
  let displayBarLabels: string[] = [];
  let displayBarData: number[] = [];

  // Helper to visually center a small number of bars by padding with empty bars
  const padBars = (labels: string[], values: number[], leftPaddingCount = 2, rightPaddingCount = 2) => {
    const leftLabels = Array(leftPaddingCount).fill('');
    const rightLabels = Array(rightPaddingCount).fill('');
    const leftValues = Array(leftPaddingCount).fill(0);
    const rightValues = Array(rightPaddingCount).fill(0);
    return {
      labels: [...leftLabels, ...labels, ...rightLabels],
      values: [...leftValues, ...values, ...rightValues],
    };
  };

  if (barRangeActive === 'today') {
    const tKey = localDayKey(new Date());
    const baseLabels = ['Today'];
    const baseValues = [Math.round(combinedDataMap[tKey] || 0)];
    const padded = padBars(baseLabels, baseValues, 2, 2);
    displayBarLabels = padded.labels;
    displayBarData = padded.values;
    console.log('[Home][Bar] Bucket (today total, centered):', baseLabels.map((l, i) => ({ label: l, value: baseValues[i] })), 'padded to', displayBarLabels.length, 'slots');
  } else if (barRangeActive === 'yesterday') {
    const y = new Date();
    y.setDate(y.getDate() - 1);
    const yKey = localDayKey(new Date(y));
    const tKey = localDayKey(new Date());
    // Insert an empty label/value between Yesterday and Today to create a visible gap
    const baseLabels = ['Yesterday', '', 'Today'];
    const baseValues = [
      Math.round(combinedDataMap[yKey] || 0),
      0,
      Math.round(combinedDataMap[tKey] || 0),
    ];
    const padded = padBars(baseLabels, baseValues, 2, 2);
    displayBarLabels = padded.labels;
    displayBarData = padded.values;
    console.log('[Home][Bar] Buckets (yesterday vs today with gap, centered):', baseLabels.map((l, i) => ({ label: l, value: baseValues[i] })), 'padded to', displayBarLabels.length, 'slots');
  } else if (barRangeActive === 'three_months') {
    const labels: string[] = [];
    const values: number[] = [];
    const now = new Date();
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      labels.push(d.toLocaleString(undefined, { month: 'short' }));
      values.push(Math.round(combinedDataMap[key] || 0));
    }
    displayBarLabels = labels;
    displayBarData = values;
    console.log('[Home][Bar] Buckets (last 6 months):', displayBarLabels.map((l, i) => ({ label: l, value: displayBarData[i] })));
  } else {
    // default daily across range (one_week, one_month, custom)
    const keys: string[] = [];
    const c = new Date(startLocal);
    while (c <= endLocal) {
      keys.push(localDayKey(new Date(c)));
      c.setDate(c.getDate() + 1);
    }
    // If one_week: show weekday names (Mon..Sun)
    if (barRangeActive === 'one_week') {
      displayBarLabels = keys.map(k => {
        const [yy, mm, dd] = k.split('-').map(n => parseInt(n, 10));
        const d = new Date(yy, mm - 1, dd, 0, 0, 0, 0);
        return d.toLocaleDateString(undefined, { weekday: 'short' });
      });
      displayBarData = keys.map(k => Math.round(combinedDataMap[k] || 0));
      console.log('[Home][Bar] Buckets (one_week, weekdays):', displayBarLabels.map((l, i) => ({ label: l, value: displayBarData[i] })));
    } else 
    // If one_month: group by week (Mon-Sun) to reduce bars
    if (barRangeActive === 'one_month') {
      type WeekBucket = { label: string; value: number };
      const weeks: WeekBucket[] = [];
      const tmp = new Date(startLocal);
      const day = tmp.getDay();
      const diffToMon = (day + 6) % 7;
      tmp.setDate(tmp.getDate() - diffToMon);
      tmp.setHours(0, 0, 0, 0);
      while (tmp <= endLocal) {
        const ws = new Date(tmp);
        const we = new Date(tmp); we.setDate(we.getDate() + 6); we.setHours(23,59,59,999);
        const label = `${String(ws.getDate()).padStart(2, '0')} ${ws.toLocaleString(undefined, { month: 'short' })}`;
        const sum = keys.reduce((acc, k) => {
          const [yy, mm, dd] = k.split('-').map(n => parseInt(n, 10));
          const d = new Date(yy, (mm - 1), dd, 0, 0, 0, 0); // local date
          if (d >= ws && d <= we) return acc + (combinedDataMap[k] || 0);
          return acc;
        }, 0);
        weeks.push({ label, value: Math.round(sum) });
        tmp.setDate(tmp.getDate() + 7);
      }
      displayBarLabels = weeks.map(w => w.label);
      displayBarData = weeks.map(w => w.value);
      console.log('[Home][Bar] Buckets (weeks in 30 days):', weeks);
    } else {
      displayBarLabels = keys.map(k => k.slice(5));
      displayBarData = keys.map(k => Math.round(combinedDataMap[k] || 0));
      console.log('[Home][Bar] Buckets (daily):', displayBarLabels.map((l, i) => ({ label: l, value: displayBarData[i] })));
    }
  }

  // 🚀 IMPROVED: Use orderType field for more accurate analytics
  const completedOrders = (orders || []).filter((o: any) => 
    withinRange(o.orderDate || o.createdAt, 'pie') && 
    (String(o.status).toUpperCase?.() === 'DELIVERED')
  ).length;
  
  // Count by orderType instead of cloth type for accuracy
  const stitchingCount = (orders || []).filter((o: any) => 
    withinRange(o.orderDate || o.createdAt, 'pie') && 
    (o.orderType === 'STITCHING' || !o.orderType) // Default to stitching for older orders
  ).length;
  
  const alterationCount = (orders || []).filter((o: any) => 
    withinRange(o.orderDate || o.createdAt, 'pie') && 
    o.orderType === 'ALTERATION'
  ).length;
  
  // Always render pie chart; use epsilon when both counts are zero so the circle renders
  const hasPieData = true;
  const stitchCount = stitchingCount || 0;
  const alterCount = alterationCount || 0;
  const pieEpsilon = (stitchCount + alterCount) === 0 ? 0.0001 : 0;

  // Log computed datasets for both charts whenever filters change
  useEffect(() => {
    const { start, end } = getRangeDates('bar');
    console.log('[Home] Bar filter applied:', { filter: barRange, start: start.toISOString(), end: end.toISOString() });
    console.log('[Home] Bar data (labels):', displayBarLabels);
    console.log('[Home] Bar data (values):', displayBarData);
  }, [barRange, customStart, customEnd, displayBarLabels.join(','), displayBarData.join(',')]);

  useEffect(() => {
    const { start, end } = getRangeDates('pie');
    console.log('[Home] Pie filter applied:', { filter: pieRange, start: start.toISOString(), end: end.toISOString() });
    console.log('[Home] Pie data:', { completedOrders, alterationCount });
  }, [pieRange, customStart, customEnd, completedOrders, alterationCount]);

  // Single color for BarChart sourced from theme

  const chartConfig = {
    backgroundGradientFrom: colors.white,
    backgroundGradientTo: colors.white,
    color: (opacity = 1) => hexToRgba(colors.charts.bar, opacity),
    labelColor: (opacity = 1) => hexToRgba('#374151', opacity),
    decimalPlaces: 0,
    propsForBackgroundLines: { stroke: colors.border },
    barPercentage: 0.6,
    formatYLabel: (value: string) => `₹${value}`,
  } as const;

  // Dimensions for charts to stay inside cards
  const WRAPPER_H_MARGIN = 20; // chartsWrapper horizontal padding
  const CARD_H_PADDING = 16;   // chartCard horizontal padding
  const chartWidth = width - (WRAPPER_H_MARGIN * 2) - (CARD_H_PADDING * 2);
  const pieChartWidth = Math.floor(chartWidth * 0.4);

  useEffect(() => {
    const fetchUserAndShopData = async () => {
      setLoading(true);
      try {
        if (accessToken) {
          apiService.setAccessToken(accessToken);
          // Decode JWT token to get user info
          const tokenPayload = JSON.parse(atob(accessToken.split('.')[1]));
          setUserInfo(tokenPayload);
          console.log('[Home] Decoded token payload:', tokenPayload);
          
          // Fetch user profile to get the latest name
          try {
            console.log('[Home] Fetching user profile...');
            const profile = await apiService.getUserProfile();
            console.log('[Home] User profile response:', profile);
            setUserProfile(profile);
          } catch (profileError) {
            console.warn('[Home] Failed to fetch user profile:', profileError);
            // Continue without profile data
          }
          
          // Get shop stats if shopId exists
            if (tokenPayload.shopId) {
            console.log('[Home] Fetching shop by id:', tokenPayload.shopId);
              setCurrentShopId(tokenPayload.shopId);
            const stats = await apiService.getShopById(tokenPayload.shopId);
            console.log('[Home] Shop stats response:', stats);
            setShopStats(stats);
            try {
              console.log('[Home] Fetching orders by shop:', tokenPayload.shopId);
              const shopOrders = await apiService.getOrdersByShop(tokenPayload.shopId);
              console.log('[Home] Orders response (by shop):', Array.isArray(shopOrders) ? shopOrders.length : shopOrders);
              const filtered = (Array.isArray(shopOrders) ? shopOrders : []).filter((o: any) => o.shopId === tokenPayload.shopId);
              setOrders(filtered);
            } catch (e) {
              console.warn('[Home] getOrdersByShop failed, falling back to getOrders. Error:', e);
              const allOrders = await apiService.getOrders();
              console.log('[Home] All orders response length:', Array.isArray(allOrders) ? allOrders.length : allOrders);
              setOrders((allOrders || []).filter((o: any) => o.shopId === tokenPayload.shopId));
            }
          } else {
            console.warn('[Home] No shopId in token; attempting to fetch /shops/my-shops to infer shop.');
            const myShops = await apiService.getMyShops();
            console.log('[Home] /shops/my-shops response:', myShops);
            const firstShop = Array.isArray(myShops) && myShops.length > 0 ? myShops[0] : null;
            if (firstShop?.id) {
              console.log('[Home] Using first shop id from my-shops:', firstShop.id);
              setCurrentShopId(firstShop.id);
              const stats = await apiService.getShopById(firstShop.id);
              console.log('[Home] Shop stats response (my-shops fallback):', stats);
              setShopStats(stats);
              try {
                // 🚀 SHOP-SPECIFIC: Fetch orders only for current shop
                console.log('[Home] Fetching orders by first shop id:', firstShop.id);
                const shopOrders = await apiService.getOrdersByShop(firstShop.id);
                console.log('[Home] Orders response (by first shop):', Array.isArray(shopOrders) ? shopOrders.length : shopOrders);
                const filtered = (Array.isArray(shopOrders) ? shopOrders : []).filter((o: any) => o.shopId === firstShop.id);
                setOrders(filtered);
              } catch (e2) {
                console.warn('[Home] getOrdersByShop (fallback) failed, fetching all orders. Error:', e2);
                const allOrders = await apiService.getOrders();
                console.log('[Home] All orders response length (fallback):', Array.isArray(allOrders) ? allOrders.length : allOrders);
                setOrders((allOrders || []).filter((o: any) => o.shopId === firstShop.id));
              }
            } else {
              console.warn('[Home] No shops found for current user.');
            }
          }
        }
      } catch (error) {
        console.error('[Home] Failed to fetch user/shop data:', error);
      } finally {
        setLoading(false);
      }
    };
    
    if (isAuthenticated && accessToken) {
      fetchUserAndShopData();
    }
  }, [accessToken, isAuthenticated]);

  // Refresh data whenever the Home screen comes into focus
  useFocusEffect(
    React.useCallback(() => {
      if (isAuthenticated && accessToken) {
        console.log('[Home] Focused: refreshing data');
        (async () => {
          try {
            const tokenPayload = accessToken ? JSON.parse(atob(accessToken.split('.')[1])) : null;
            
            // Refresh user profile to get latest name
            try {
              console.log('[Home] Focus refresh: fetching user profile...');
              const profile = await apiService.getUserProfile();
              console.log('[Home] Focus refresh: user profile response:', profile);
              setUserProfile(profile);
            } catch (profileError) {
              console.warn('[Home] Focus refresh: failed to fetch user profile:', profileError);
            }
            
            let shopId = tokenPayload?.shopId ?? currentShopId ?? shopStats?.id ?? null;
            if (!shopId) {
              try {
                const myShops = await apiService.getMyShops();
                const firstShop = Array.isArray(myShops) && myShops.length > 0 ? myShops[0] : null;
                if (firstShop?.id) {
                  shopId = firstShop.id;
                  setCurrentShopId(firstShop.id);
                }
              } catch {}
            }
            if (shopId) {
              const stats = await apiService.getShopById(shopId);
              console.log('[Home] Focus refresh shop stats:', stats);
              setShopStats(stats);
              const shopOrders = await apiService.getOrdersByShop(shopId);
              const filtered = (Array.isArray(shopOrders) ? shopOrders : []).filter((o: any) => o.shopId === shopId);
              setOrders(filtered);
              await refreshPayments(shopId);
            }
          } catch (e) {
            console.warn('[Home] Focus refresh failed:', e);
          }
        })();
      }
      return () => {};
    }, [isAuthenticated, accessToken, barRange, customStart, customEnd, currentShopId])
  );

  if (!isAuthenticated) {
    return (
      <View style={styles.notAuthenticatedContainer}>
        <Text style={styles.notAuthenticatedText}>Please log in to view your profile</Text>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <View style={styles.overlay}>
        <ScrollView style={{ flex: 1 }} contentContainerStyle={{ flexGrow: 1 }}>
            {/* Header Section (Wave Navbar) */}
            <View style={styles.headerSection}>
              <Svg
                height={170}
                width={width}
                viewBox="0 0 1440 320"
                preserveAspectRatio="none"
                style={styles.waveSvg}
              >
                <Path
                  fill={hexToRgba(colors.brand, 0.7)}
                  d="M0,50 C800,30 520,160 1440,160 L1440,320 L0,320 Z"
                  transform="scale(1,-1) translate(0, -320)"
                />
              </Svg>
              <View style={styles.headerTextContainer}>
                <View style={styles.headerProfileRow}>
                  <View style={styles.avatarContainer}>
                    {/* If you later have an image URL, replace the inner Text with an Image component */}
                    <TitleText style={styles.avatarInitial}>{userInitial}</TitleText>
                  </View>
                  <View>
                    <TitleText style={styles.headerWelcome}>{t('home.hi', { name: displayName })}</TitleText>
                    <RegularText style={styles.headerGreeting}>{getISTGreeting()}</RegularText>
                  </View>
                </View>
              </View>
            </View>

            {/* User Welcome */}
            <View style={styles.userWelcomeSection}>
              <TitleText style={styles.welcomeText}>Welcome</TitleText>
              <TitleText style={styles.userNameText}>{displayName}</TitleText>
            </View>


            {/* Image Carousel (wide, short height) */}
            <View style={styles.carouselWrapper}>
              <View style={styles.carouselClip}>
                <ScrollView
                  ref={carouselRef}
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  snapToInterval={snapWidth}
                  decelerationRate="fast"
                  onMomentumScrollEnd={(e) => {
                    const idx = Math.round(e.nativeEvent.contentOffset.x / snapWidth);
                    setCarouselIndex(idx);
                  }}
                >
                  {slides.map((src, idx) => (
                    <View key={idx} style={{ width: slideWidth, height: slideHeight, marginRight: idx === slides.length - 1 ? 0 : slideGap }}>
                      <Image source={src} style={{ width: '100%', height: '100%' }} resizeMode="cover" />
                    </View>
                  ))}
                </ScrollView>
              </View>
            </View>

          {/* Quick Actions */}
          <View style={styles.actionRow}>
            <TouchableOpacity onPress={() => navigation.navigate('Customers')}>
              <Card variant="action" style={styles.actionCard}>
                                  <View style={styles.actionCardContent}>
                    <Text style={styles.plusIcon}>+</Text>
                    <Text style={styles.actionCardTitle}>{t('home.addCustomer')}</Text>
                  </View>
              </Card>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => navigation.navigate('Tailors')}>
              <Card variant="action" style={styles.actionCard}>
                                  <View style={styles.actionCardContent}>
                    <Text style={styles.plusIcon}>+</Text>
                    <Text style={styles.actionCardTitle}>{t('home.addTailor')}</Text>
                  </View>
              </Card>
            </TouchableOpacity>
          </View>

          {/* Charts */}
          <View style={styles.chartsWrapper}>
            <Card style={styles.chartCard}>
              <View style={styles.chartHeader}>
                <View>
                  <TitleText style={styles.chartTitle}>{t('home.dailyEarnings')}</TitleText>
                  <RegularText style={styles.chartSubtitle}>Order Amounts (₹)</RegularText>
                </View>
                <View style={styles.chartRange}>
                  <Dropdown
                    value={barRange}
                    onChange={setBarRange}
                    options={RANGE_OPTIONS}
                    placeholder={t('common.range')}
                  />
                </View>
              </View>
              {barRange === 'custom' && (
                <View style={styles.customRangeRow}>
                  <View style={{ flex: 1 }}>
                    <DatePicker label="Start" value={customStart} onChange={setCustomStart} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <DatePicker label="End" value={customEnd} onChange={setCustomEnd} />
                  </View>
                </View>
              )}
              
              {displayBarLabels.length > 0 ? (
                <>
                  <BarChart
                    data={{ labels: displayBarLabels, datasets: [{ data: displayBarData }] }}
                    width={chartWidth}
                    height={200}
                    chartConfig={chartConfig}
                    fromZero
                    showBarTops={false}
                    style={{ borderRadius: 12, alignSelf: 'center' }}
                    yAxisLabel=""
                    yAxisSuffix=""
                  />
                  <View style={styles.legendRow}>
                    <View style={styles.legendItem}>
                      <View style={[styles.legendDot, { backgroundColor: colors.charts.bar }]} />
                      <RegularText style={styles.legendText}>Order Amounts (₹)</RegularText>
                    </View>
                  </View>
                </>
              ) : (
                <RegularText style={styles.chartEmpty}>{t('common.no_data')}</RegularText>
              )}
            </Card>

            <Card style={styles.chartCard}>
              <View style={styles.chartHeader}>
                <TitleText style={styles.chartTitle}>{t('home.ordersStatus')}</TitleText>
                <View style={styles.chartRange}>
                  <Dropdown
                    value={pieRange}
                    onChange={setPieRange}
                    options={RANGE_OPTIONS}
                    placeholder={t('common.range')}
                  />
                </View>
              </View>
              {pieRange === 'custom' && (
                <View style={styles.customRangeRow}>
                  <View style={{ flex: 1 }}>
                    <DatePicker label="Start" value={customStart} onChange={setCustomStart} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <DatePicker label="End" value={customEnd} onChange={setCustomEnd} />
                  </View>
                </View>
              )}
              {hasPieData ? (
                <View style={styles.pieRow}>
                  <View style={styles.pieLeft}>
                    <PieChart
                      data={[
                        { name: t('home.newStitch'), population: stitchCount + pieEpsilon, color: colors.charts.pieCompleted, legendFontColor: colors.textPrimary as string, legendFontSize: 12 },
                        { name: t('home.alterations'), population: alterCount + pieEpsilon, color: colors.charts.pieAlterations, legendFontColor: colors.textPrimary as string, legendFontSize: 12 },
                      ]}
                      width={pieChartWidth}
                      height={150}
                      chartConfig={chartConfig as any}
                      accessor="population"
                      backgroundColor="transparent"
                      paddingLeft="16"
                      hasLegend={false}
                      center={[20, 0]}
                      style={{ marginLeft: 0 }}
                    />
                  </View>
                  <View style={styles.pieLegendCol}>
                    <View style={styles.legendItem}>
                      <View style={[styles.legendDot, { backgroundColor: colors.charts.pieCompleted }]} />
                      <RegularText style={styles.legendText} numberOfLines={1}>{t('home.newStitch')}: {stitchCount}</RegularText>
                    </View>
                    <View style={styles.legendItem}>
                      <View style={[styles.legendDot, { backgroundColor: colors.charts.pieAlterations }]} />
                      <RegularText style={styles.legendText} numberOfLines={1}>{t('home.alterations')}: {alterCount}</RegularText>
                    </View>
                  </View>
                </View>
              ) : (
                <View style={styles.pieRow}>
                  <View style={styles.pieLeft}>
                    <PieChart
                      data={[
                        { name: t('home.newStitch'), population: 0.0001, color: colors.charts.pieCompleted, legendFontColor: colors.textPrimary as string, legendFontSize: 12 },
                        { name: t('home.alterations'), population: 0.0001, color: colors.charts.pieAlterations, legendFontColor: colors.textPrimary as string, legendFontSize: 12 },
                      ]}
                      width={pieChartWidth}
                      height={150}
                      chartConfig={chartConfig as any}
                      accessor="population"
                      backgroundColor="transparent"
                      paddingLeft="16"
                      hasLegend={false}
                      center={[20, 0]}
                      style={{ marginLeft: 0 }}
                    />
                  </View>
                  <View style={styles.pieLegendCol}>
                    <View style={styles.legendItem}>
                      <View style={[styles.legendDot, { backgroundColor: colors.charts.pieCompleted }]} />
                      <RegularText style={styles.legendText}>{t('home.newStitch')}: 0</RegularText>
                    </View>
                    <View style={styles.legendItem}>
                      <View style={[styles.legendDot, { backgroundColor: colors.charts.pieAlterations }]} />
                      <RegularText style={styles.legendText}>{t('home.alterations')}: 0</RegularText>
                    </View>
                  </View>
                </View>
              )}
            </Card>
          </View>

          {/* Stats Overview */}
          <View style={styles.statsSection}>
            <TitleText style={styles.sectionHeading}>{t('tailor.tailors')}</TitleText>
            <View style={styles.statsGrid}>
              <Card variant="stats" style={styles.statsCard}>
                <Icon name="tape-measure" size={28} color="#2DBE91" style={[styles.statsIcon, { opacity: 1, backgroundColor: 'transparent' }]} />
                <RegularText style={styles.statsLabell}>Progress: {activeTailors}</RegularText>
              </Card>
              <Card variant="stats" style={styles.statsCard}>
                <Icon name="account-off" size={28} color="#2DBE91" style={[styles.statsIcon, { opacity: 1, backgroundColor: 'transparent' }]} />
                <RegularText style={styles.statsLabell}>{t('status.pending')}: {inactiveTailors}</RegularText>
              </Card>
              <Card variant="stats" style={styles.statsCard}>
                <Icon name="account-hard-hat" size={28} color="#2DBE91" style={[styles.statsIcon, { opacity: 1, backgroundColor: 'transparent' }]} />
                <RegularText style={styles.statsLabell}>{t('common.total') || 'Total'}: {totalTailors}</RegularText>
              </Card>
            </View>

            <TitleText style={[styles.sectionHeading, { marginTop: 8 }]}>{t('customer.customers')}</TitleText>
            <View style={styles.orderStatsGrid}>
              <Card variant="stats" style={styles.orderStatsCard}>
                <Icon name="account-clock" size={28} color="#2DBE91" style={[styles.statsIcon, { opacity: 1, backgroundColor: 'transparent' }]} />
                <RegularText style={styles.statsLabel}>Progress: {activeCustomers}</RegularText>
              </Card>
              <Card variant="stats" style={styles.orderStatsCard}>
                <Icon name="account-check" size={28} color="#2DBE91" style={[styles.statsIcon, { opacity: 1, backgroundColor: 'transparent' }]} />
                <RegularText style={styles.statsLabel}>{t('status.delivered')}: {deliveredCustomers}</RegularText>
              </Card>
            </View>
            <View style={styles.orderStatsGrid}>
              <Card variant="stats" style={styles.orderStatsCard}>
                <Icon name="account-cancel" size={28} color="#2DBE91" style={[styles.statsIcon, { opacity: 1, backgroundColor: 'transparent' }]} />
                <RegularText style={styles.statsLabel}>{t('status.pending')}: {pendingCustomers}</RegularText>
              </Card>
              <Card variant="stats" style={styles.orderStatsCard}>
                <Icon name="account-multiple" size={28} color="#2DBE91" style={[styles.statsIcon, { opacity: 1, backgroundColor: 'transparent' }]} />
                <RegularText style={styles.statsLabel}>{t('common.total') || 'Total'}: {totalCustomers}</RegularText>
              </Card>
            </View>

            <TitleText style={[styles.sectionHeading, { marginTop: 8 }]}>{t('order.orders')}</TitleText>
            <View style={styles.orderStatsGrid}>
              <Card variant="stats" style={styles.orderStatsCard}>
                <Icon name="clipboard-list" size={28} color="#2DBE91" style={[styles.statsIcon, { opacity: 1, backgroundColor: 'transparent' }]} />
                <RegularText style={styles.statsLabel}>{t('order.total')}: {shopStats?.totalOrders ?? '0'}</RegularText>
              </Card>
              <Card variant="stats" style={styles.orderStatsCard}>
                <Icon name="clipboard-clock" size={28} color="#2DBE91" style={[styles.statsIcon, { opacity: 1, backgroundColor: 'transparent' }]} />
                <RegularText style={styles.statsLabel}>{t('order.activeOrders')}: {shopStats?.totalActiveOrders ?? '0'}</RegularText>
              </Card>
            </View>
            <View style={styles.orderStatsGrid}>
              <Card variant="stats" style={styles.orderStatsCard}>
                <Icon name="progress-clock" size={28} color="#2DBE91" style={[styles.statsIcon, { opacity: 1, backgroundColor: 'transparent' }]} />
                <RegularText style={styles.statsLabel}>{t('order.pendingOrders')}: {shopStats?.pendingOrders ?? '0'}</RegularText>
              </Card>
              <Card variant="stats" style={styles.orderStatsCard}>
                <Icon name="check-circle" size={28} color="#2DBE91" style={[styles.statsIcon, { opacity: 1, backgroundColor: 'transparent' }]} />
                <RegularText style={styles.statsLabel}>{t('order.completedOrders')}: {shopStats?.deliveredOrders ?? '0'}</RegularText>
              </Card>
            </View>
          </View>
        </ScrollView>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: colors.background,
  },
  carouselWrapper: {
    marginHorizontal: 20,
    marginTop: 8,
    marginBottom: 12,
    borderRadius: 12,
    backgroundColor: colors.card,
    shadowColor: colors.shadow,
    shadowOpacity: 0.35,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 4,
  },
  carouselClip: {
    borderRadius: 12,
    overflow: 'hidden',
  },
  
  headerSection: {
    backgroundColor: 'transparent',
    paddingTop: 48,
    paddingBottom: 16,
    paddingHorizontal: 20,
    height: 170,
    position: 'relative',
    overflow: 'hidden',
  },
  waveSvg: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 0,
  },
  headerTextContainer: {
    zIndex: 1,
  },
  headerProfileRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  avatarContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.25)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.35)'
  },
  avatarInitial: {
    color: colors.white,
    fontSize: 18,
    fontWeight: '700',
  },
  headerWelcome: {
    color: colors.black,
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  headerGreeting: {
    color: 'rgba(5, 4, 4, 0.9)',
    fontSize: 14,

    marginTop: -4,
  },
  headerUserName: {
    color: colors.white,
    fontSize: 20,
    fontWeight: 'bold',
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerTitle: {
    color: colors.white,
    fontSize: 18,
    fontWeight: '600',
  },
  androidIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.brand,
    justifyContent: 'center',
    alignItems: 'center',
  },
  androidIconText: {
    fontSize: 18,
  },
  userWelcomeSection: {
    backgroundColor: 'transparent',
    paddingHorizontal: 20,
    paddingBottom: 24,
    display: 'none',
  },
  welcomeText: {
    color: '#0f172a',
    fontSize: 24,
    fontWeight: '600',
    marginBottom: 4,
  },
  userNameText: {
    color: '#0f172a',
    fontSize: 20,
    fontWeight: 'bold',
  },
  actionRow: {
    flexDirection: 'column',
    paddingHorizontal: 20,
    marginBottom: 24,
    marginTop: 24,
  },
  actionCard: {
    height:70,
    flexDirection:'row',
    marginBottom: 12,
    justifyContent: 'flex-start',
    alignItems: 'center',
    gap:10
  },
  actionCardContent: {
    flexDirection:'row',
    height:60,
    alignItems: 'center',
    justifyContent: 'flex-start',
    paddingLeft: 15,
  },
  plusIcon: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.white,
    marginRight: 12,
    marginBottom:10
  },
  actionCardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.white,
    marginBottom: 7,
  },
  actionCardSubtitle: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  statsSection: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  statsTitle: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  sectionHeading: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: 10,
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
  },
  statsCard: {
    width: '32%', // Three cards per row
    marginBottom: 10,
  },
  orderStatsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  orderStatsCard: {
    width: '48%', // Two cards per row
  },
  statsValue: {
    fontSize: 28,
    fontWeight: 'bold',
    color: colors.textPrimary,
    marginBottom: 8,
    textShadowColor: 'transparent',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 0,
  },
  statsLabel: {
    fontSize: 13,
    color: colors.textPrimary,
    fontWeight: '600',
    textShadowColor: 'transparent',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 0,
  },
  statsLabell: {
    fontSize: 13,
    color: colors.textPrimary,
    fontWeight: '600',
    textAlign: 'center',
    // textShadowColor: 'transparent',
    // textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 0,
  },
  statsIcon: {
    marginBottom: 6,
    opacity: 1,
    backgroundColor: 'transparent',
  },
  chartsWrapper: {
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  chartCard: {
    padding: 16,
    marginBottom: 12,
  },
  chartTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#0f172a',
    marginBottom: 4,
  },
  chartSubtitle: {
    fontSize: 12,
    color: colors.textMuted,
    marginBottom: 8,
  },
  chartHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  chartRange: {
    alignItems: 'flex-end',
  },
  customRangeRow: {
    flexDirection: 'row',
    gap: 12,
  },
  chartEmpty: {
    color: colors.textMuted,
  },
  legendRow: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    gap: 16,
    marginBottom: 8,
    paddingLeft: 8,
    width: '100%',
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 9,
    flex: 1,
    marginBottom: 8,
  },
  legendDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  legendText: {
    color: colors.textPrimary,
    fontSize: 12,
    lineHeight: 16,
    textAlignVertical: 'center',
    flexShrink: 0,
  },
  pieRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
    // gap: 8,
  },
  pieLeft: {
    flexShrink: 0,
    paddingLeft: 18,
    marginLeft: 0,
    marginRight: 12,
  },
  pieLegendCol: {
    flex: 1,
    justifyContent: 'flex-start',
    alignItems: 'flex-start',
    paddingLeft: 10,
    paddingTop: 10,
  },
  notAuthenticatedContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
  },
  notAuthenticatedText: {
    fontSize: 18,
    color: colors.textSecondary,
    textAlign: 'center',
  },
});

export default Home; 