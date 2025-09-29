import { StyleSheet } from 'react-native';
import colors from '../../constants/colors';

export const styles = StyleSheet.create({
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
    paddingHorizontal: 30, // Increased from 20 to 24 for more right margin
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
    paddingRight: 20, // Added small padding to ensure text doesn't get cut off
  },
  headerProfileRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingRight: 10, // Added extra padding on the right to prevent cutoff
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
    width: '32%',
    marginBottom: 10,
  },
  orderStatsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  orderStatsCard: {
    width: '48%',
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
    textShadowRadius: 0,
  },
  statsIcon: {
    marginBottom: 6,
    opacity: 1,
    backgroundColor: 'transparent',
  },
  chartsWrapper: {
    paddingHorizontal: 16, // Reduced from 20 to 16 to give more space
    marginBottom: 16,
  },
  chartCard: {
    padding: 13, // Reduced from 16 to 12 to give more space for content
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
    paddingRight: 20, // Added small padding to prevent dropdown cutoff
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
    gap: 0,
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
  },
  pieLeft: {
    flexShrink: 0,
    paddingLeft: 28,
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


