import React from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';

// ─── Types ───────────────────────────────────────────────
interface SettingGroup {
  icon: string;
  title: string;
  description: string;
}

interface AccountInfo {
  label: string;
  value: string;
}

interface SettingsProps {
  settingGroups?: SettingGroup[];
  accountInfo?: AccountInfo[];
}

// ─── Default Data ─────────────────────────────────────────
const defaultGroups: SettingGroup[] = [
  { icon: '👤', title: 'Profile', description: 'Manage your personal information and preferences' },
  { icon: '🔔', title: 'Notifications', description: 'Configure push notifications and email alerts' },
  { icon: '🛡️', title: 'Privacy & Security', description: 'Control your account security and data privacy' },
  { icon: '🎨', title: 'Appearance', description: 'Customize theme, colors, and display options' },
  { icon: '🌐', title: 'Language & Region', description: 'Set your preferred language and regional settings' },
];

const defaultAccountInfo: AccountInfo[] = [
  { label: 'Full Name', value: 'Md. Rahim Uddin' },
  { label: 'Email', value: 'rahim.uddin@example.com' },
  { label: 'Exam Target', value: 'BCS 47th' },
  { label: 'Member Since', value: 'January 2024' },
];

// ─── Component ────────────────────────────────────────────
export default function Settings({
  settingGroups = defaultGroups,
  accountInfo = defaultAccountInfo,
}: SettingsProps) {
  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
      showsVerticalScrollIndicator={false}
    >
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerIcon}>
          <Text style={styles.headerIconText}>⚙️</Text>
        </View>
        <View style={styles.headerTextWrap}>
          <Text style={styles.headerTitle}>Settings</Text>
          <Text style={styles.headerSubtitle}>
            Manage your account and application preferences
          </Text>
        </View>
      </View>

      {/* Settings Groups */}
      <View style={styles.settingsGrid}>
        {settingGroups.map((group, index) => (
          <TouchableOpacity key={index} style={styles.settingCard} activeOpacity={0.7}>
            <View style={styles.settingIconWrap}>
              <Text style={styles.settingIcon}>{group.icon}</Text>
            </View>
            <View style={styles.settingContent}>
              <Text style={styles.settingTitle}>{group.title}</Text>
              <Text style={styles.settingDesc}>{group.description}</Text>
            </View>
            <Text style={styles.chevron}>›</Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Account Info */}
      <View style={styles.accountSection}>
        <Text style={styles.accountTitle}>Account Information</Text>
        <View style={styles.accountGrid}>
          {accountInfo.map((item, index) => (
            <View key={index} style={styles.accountItem}>
              <Text style={styles.accountLabel}>{item.label}</Text>
              <Text style={styles.accountValue}>{item.value}</Text>
            </View>
          ))}
        </View>
      </View>
    </ScrollView>
  );
}

// ─── Styles ──────────────────────────────────────────────
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  contentContainer: {
    padding: 24,
    paddingBottom: 40,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 28,
  },
  headerIcon: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: '#1a2332',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerIconText: {
    fontSize: 20,
  },
  headerTextWrap: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: '#0f172a',
  },
  headerSubtitle: {
    fontSize: 13,
    color: '#6b7280',
    marginTop: 2,
  },
  settingsGrid: {
    gap: 12,
    marginBottom: 28,
  },
  settingCard: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 18,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    borderWidth: 1,
    borderColor: '#f1f5f9',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1,
  },
  settingIconWrap: {
    width: 42,
    height: 42,
    borderRadius: 12,
    backgroundColor: '#f1f5f9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  settingIcon: {
    fontSize: 18,
  },
  settingContent: {
    flex: 1,
  },
  settingTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#1e293b',
    marginBottom: 2,
  },
  settingDesc: {
    fontSize: 12,
    color: '#94a3b8',
  },
  chevron: {
    fontSize: 22,
    color: '#cbd5e1',
    fontWeight: '300',
  },
  accountSection: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 24,
    borderWidth: 1,
    borderColor: '#f1f5f9',
  },
  accountTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: '#1e293b',
    marginBottom: 16,
  },
  accountGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  accountItem: {
    width: '47%',
    backgroundColor: '#f8fafc',
    borderRadius: 12,
    padding: 14,
  },
  accountLabel: {
    fontSize: 11,
    color: '#94a3b8',
    fontWeight: '600',
    marginBottom: 4,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  accountValue: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1e293b',
  },
});
