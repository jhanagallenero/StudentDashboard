import AsyncStorage from '@react-native-async-storage/async-storage';
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Dimensions,
  FlatList,
  Modal,
  ScrollView,
  StatusBar,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const { width } = Dimensions.get("window");

const COURSES = ["BSICT", "BSCS", "BSIS"];
const SECTIONS = ["A1", "A2", "B1", "B2"];
const YEARS = ["1st Yr", "2nd Yr", "3rd Yr", "4th Yr"];

export default function App() {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);

  // Form state
  const [formId, setFormId] = useState("");
  const [formName, setFormName] = useState("");
  const [formCourse, setFormCourse] = useState("");
  const [formSection, setFormSection] = useState("");
  const [formYear, setFormYear] = useState("");
  const [formError, setFormError] = useState("");

  // Picker modals
  const [showCoursePicker, setShowCoursePicker] = useState(false);
  const [showSectionPicker, setShowSectionPicker] = useState(false);
  const [showYearPicker, setShowYearPicker] = useState(false);

  // Toast
  const [toast, setToast] = useState("");
  const [toastVisible, setToastVisible] = useState(false);

  useEffect(() => {
  const loadStudents = async () => {
    try {
      // ⬇️ ADD THIS DELAY (2 seconds)
      await new Promise(resolve => setTimeout(resolve, 2000));

      const data = await AsyncStorage.getItem("students");
      if (data) {
        setStudents(JSON.parse(data));
      }
    } catch (e) {
      console.log("Error loading students", e);
    } finally {
      setLoading(false);
    }
  };

  loadStudents();
}, []);

useEffect(() => {
  AsyncStorage.setItem("students", JSON.stringify(students));
}, [students]);

  const showToast = (msg) => {
    setToast(msg);
    setToastVisible(true);
    setTimeout(() => setToastVisible(false), 2800);
  };

  const getInitials = (name) => {
    return name
      .split(/[\s,]+/)
      .filter(Boolean)
      .map((w) => w[0])
      .slice(0, 2)
      .join("")
      .toUpperCase();
  };

  const enrollStudent = () => {
    setFormError("");
    if (!formId.trim() || !formName.trim() || !formCourse || !formSection || !formYear) {
      setFormError("Please fill in all fields before enrolling.");
      return;
    }
    if (students.find((s) => s.id === formId.trim())) {
      setFormError("A student with this ID already exists.");
      return;
    }

    const newStudent = {
      id: formId.trim(),
      name: formName.trim(),
      course: formCourse,
      section: formSection,
      year: formYear,
      active: true,
    };

    setStudents((prev) => [...prev, newStudent]);

    setFormId("");
    setFormName("");
    setFormCourse("");
    setFormSection("");
    setFormYear("");
    setFormError("");

    showToast(`${newStudent.name} enrolled in ${newStudent.course} — Section ${newStudent.section}`);
  };

  const confirmDelete = (student) => {
    Alert.alert(
      "Remove Student",
      `"${student.name}" (${student.id}) will be permanently removed from the roster.`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Remove",
          style: "destructive",
          onPress: () => {
            setStudents((prev) => prev.filter((s) => s.id !== student.id));
            showToast(`${student.name} has been removed.`);
          },
        },
      ]
    );
  };

  const toggleActive = (id) => {
    setStudents((prev) =>
      prev.map((s) => (s.id === id ? { ...s, active: !s.active } : s))
    );
  };

  const totalActive = students.filter((s) => s.active).length;
  const uniqueCourses = new Set(students.map((s) => s.course)).size;

  const renderStudent = ({ item }) => (
    <View style={[styles.studentCard, item.active && styles.studentCardActive]}>
      <View style={[styles.avatar, item.active ? styles.avatarActive : styles.avatarInactive]}>
        <Text style={[styles.avatarText, item.active ? styles.avatarTextActive : styles.avatarTextInactive]}>
          {getInitials(item.name)}
        </Text>
      </View>

      <View style={styles.studentInfo}>
        <Text style={styles.studentName} numberOfLines={1}>{item.name}</Text>
        <Text style={styles.studentMeta}>
          {item.id} · {item.course} · {item.year} · Sec {item.section}
        </Text>

        <View style={[styles.badge, item.active ? styles.badgeActive : styles.badgeInactive]}>
          <View style={[styles.dot, item.active ? styles.dotActive : styles.dotInactive]} />
          <Text style={[styles.badgeText, item.active ? styles.badgeTextActive : styles.badgeTextInactive]}>
            {item.active ? "Active" : "Inactive"}
          </Text>
        </View>
      </View>

      <View style={styles.cardActions}>
        <Switch
          value={item.active}
          onValueChange={() => toggleActive(item.id)}
          trackColor={{ false: "#D3D1C7", true: "#5DCAA5" }}
          thumbColor="#fff"
          ios_backgroundColor="#D3D1C7"
        />

        <TouchableOpacity style={styles.deleteBtn} onPress={() => confirmDelete(item)}>
          <Text style={styles.deleteBtnText}>✕</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.loaderContainer}>
        <StatusBar barStyle="dark-content" backgroundColor="#f5f4f0" />
        <ActivityIndicator size="large" color="#1D9E75" />
        <Text style={styles.loaderText}>Loading students...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <StatusBar barStyle="dark-content" backgroundColor="#f5f4f0" />

        <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">

          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.pageTitle}>Student Dashboard</Text>
            <Text style={styles.pageSub}>Enroll and manage your students</Text>
          </View>

          {/* Toast */}
          {toastVisible && (
            <View style={styles.toast}>
              <Text style={styles.toastText}>{toast}</Text>
            </View>
          )}

          {/* Stats */}
          <View style={styles.statsRow}>
            <View style={styles.statCard}>
              <Text style={styles.statLabel}>Total</Text>
              <Text style={styles.statValue}>{students.length}</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statLabel}>Active</Text>
              <Text style={[styles.statValue, styles.statActive]}>{totalActive}</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statLabel}>Inactive</Text>
              <Text style={[styles.statValue, styles.statInactive]}>
                {students.length - totalActive}
              </Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statLabel}>Courses</Text>
              <Text style={styles.statValue}>{uniqueCourses}</Text>
            </View>
          </View>

          {/* Enrollment Form */}
          <View style={styles.formCard}>
            <View style={styles.formTitleRow}>
              <Text style={styles.formTitle}>Enroll Student</Text>
              <View style={styles.newBadge}><Text style={styles.newBadgeText}>NEW</Text></View>
            </View>

            <View style={styles.fieldGroup}>
              <Text style={styles.fieldLabel}>Student ID</Text>
              <TextInput
                style={[styles.input, formError && !formId ? styles.inputError : null]}
                placeholder="e.g. 2024-001"
                value={formId}
                onChangeText={setFormId}
              />
            </View>

            <View style={styles.fieldGroup}>
              <Text style={styles.fieldLabel}>Full Name</Text>
              <TextInput
                style={[styles.input, formError && !formName ? styles.inputError : null]}
                placeholder="Last, First Middle"
                value={formName}
                onChangeText={setFormName}
              />
            </View>

            <View style={styles.twoCol}>
              <TouchableOpacity style={styles.picker} onPress={() => setShowCoursePicker(true)}>
                <Text>{formCourse || "Select course..."}</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.picker} onPress={() => setShowSectionPicker(true)}>
                <Text>{formSection ? `Section ${formSection}` : "Section..."}</Text>
              </TouchableOpacity>

            </View>

            <View style={{ marginTop: 10 }}>
              <TouchableOpacity style={styles.picker} onPress={() => setShowYearPicker(true)}>
                <Text>{formYear || "Select year..."}</Text>
              </TouchableOpacity>
            </View>

            {formError ? <Text style={styles.errorText}>{formError}</Text> : null}

            <TouchableOpacity style={styles.enrollBtn} onPress={enrollStudent}>
              <Text style={styles.enrollBtnText}>Enroll Student</Text>
            </TouchableOpacity>
          </View>


          {/* Roster */}
          <View style={styles.rosterHeader}>
            <Text style={styles.rosterLabel}>Roster ({students.length} enrolled)</Text>
          </View>

          {students.length === 0 ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyText}>No students enrolled yet.</Text>
            </View>
          ) : (
            <FlatList
              data={students}
              keyExtractor={(item) => item.id}
              renderItem={renderStudent}
              scrollEnabled={false}
              contentContainerStyle={{ gap: 8 }}
            />
          )}

        </ScrollView>
      </View>

      {/* Course Picker Modal */}
      <Modal visible={showCoursePicker} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalSheet}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select Course</Text>
              <TouchableOpacity onPress={() => setShowCoursePicker(false)}>
                <Text style={styles.modalClose}>✕</Text>
              </TouchableOpacity>
            </View>

            <ScrollView>
              {COURSES.map((c) => (
                <TouchableOpacity
                  key={c}
                  style={[
                    styles.modalOption,
                    formCourse === c && styles.modalOptionSelected
                  ]}
                  onPress={() => {
                    setFormCourse(c);
                    setShowCoursePicker(false);
                  }}
                >
                  <Text
                    style={[
                      styles.modalOptionText,
                      formCourse === c && styles.modalOptionTextSelected
                    ]}
                  >
                    {c}
                  </Text>
                  {formCourse === c && <Text style={styles.checkmark}>✓</Text>}
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Section Picker Modal */}
      <Modal visible={showSectionPicker} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalSheet}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select Section</Text>
              <TouchableOpacity onPress={() => setShowSectionPicker(false)}>
                <Text style={styles.modalClose}>✕</Text>
              </TouchableOpacity>
            </View>

            {SECTIONS.map((s) => (
              <TouchableOpacity
                key={s}
                style={[
                  styles.modalOption,
                  formSection === s && styles.modalOptionSelected
                ]}
                onPress={() => {
                  setFormSection(s);
                  setShowSectionPicker(false);
                }}
              >
                <Text
                  style={[
                    styles.modalOptionText,
                    formSection === s && styles.modalOptionTextSelected
                  ]}
                >
                  Section {s}
                </Text>
                {formSection === s && <Text style={styles.checkmark}>✓</Text>}
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </Modal>

      <Modal visible={showYearPicker} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalSheet}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select Year</Text>
              <TouchableOpacity onPress={() => setShowYearPicker(false)}>
                <Text style={styles.modalClose}>✕</Text>
              </TouchableOpacity>
            </View>

            {YEARS.map((y) => (
              <TouchableOpacity
                key={y}
                style={[
                  styles.modalOption,
                  formYear === y && styles.modalOptionSelected
                ]}
                onPress={() => {
                  setFormYear(y);
                  setShowYearPicker(false);
                }}
              >
                <Text
                  style={[
                    styles.modalOptionText,
                    formYear === y && styles.modalOptionTextSelected
                  ]}
                >
                  {y}
                </Text>
                {formYear === y && <Text style={styles.checkmark}>✓</Text>}
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#f5f4f0",
  },
  container: {
    flex: 1,
    backgroundColor: "#f5f4f0",
  },
  scroll: {
    padding: width * 0.05,
    paddingBottom: 40,
  },

  // Loader
  loaderContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f5f4f0",
    gap: 12,
  },
  loaderText: {
    fontSize: 14,
    color: "#888780",
    marginTop: 8,
  },

  // Header
  header: {
    marginBottom: 16,
  },
  pageTitle: {
    fontSize: width * 0.06,
    fontWeight: "600",
    color: "#2C2C2A",
  },
  pageSub: {
    fontSize: 13,
    color: "#888780",
    marginTop: 2,
  },

  // Toast
  toast: {
    backgroundColor: "#E1F5EE",
    borderWidth: 0.5,
    borderColor: "#5DCAA5",
    borderRadius: 8,
    padding: 10,
    marginBottom: 12,
  },
  toastText: {
    fontSize: 13,
    color: "#085041",
  },

  // Stats
  statsRow: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 16,
  },
  statCard: {
    flex: 1,
    backgroundColor: "#eceae3",
    borderRadius: 8,
    padding: 10,
  },
  statLabel: {
    fontSize: 10,
    color: "#888780",
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginBottom: 3,
  },
  statValue: {
    fontSize: 20,
    fontWeight: "600",
    color: "#2C2C2A",
  },
  statActive: { color: "#0F6E56" },
  statInactive: { color: "#993C1D" },

  // Form Card
  formCard: {
    backgroundColor: "#fff",
    borderRadius: 12,
    borderWidth: 0.5,
    borderColor: "#D3D1C7",
    padding: 16,
    marginBottom: 16,
  },
  formTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 14,
  },
  formTitle: {
    fontSize: 15,
    fontWeight: "600",
    color: "#2C2C2A",
  },
  newBadge: {
    backgroundColor: "#E1F5EE",
    borderRadius: 4,
    paddingHorizontal: 7,
    paddingVertical: 2,
  },
  newBadgeText: {
    fontSize: 10,
    fontWeight: "600",
    color: "#0F6E56",
    letterSpacing: 0.5,
  },

  // Fields
  fieldGroup: {
    marginBottom: 12,
  },
  fieldLabel: {
    fontSize: 11,
    fontWeight: "600",
    color: "#888780",
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginBottom: 5,
  },
  input: {
    height: 40,
    borderWidth: 0.5,
    borderColor: "#B4B2A9",
    borderRadius: 8,
    paddingHorizontal: 12,
    fontSize: 14,
    backgroundColor: "#fff",
    color: "#2C2C2A",
  },
  inputError: {
    borderColor: "#E24B4A",
    borderWidth: 1,
  },
  twoCol: {
    flexDirection: "row",
    gap: 10,
  },
  picker: {
    height: 40,
    borderWidth: 0.5,
    borderColor: "#B4B2A9",
    borderRadius: 8,
    paddingHorizontal: 12,
    backgroundColor: "#fff",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  pickerValue: {
    fontSize: 14,
    color: "#2C2C2A",
    flex: 1,
  },
  pickerPlaceholder: {
    fontSize: 14,
    color: "#B4B2A9",
    flex: 1,
  },
  pickerArrow: {
    fontSize: 12,
    color: "#888780",
  },
  errorText: {
    fontSize: 12,
    color: "#A32D2D",
    marginBottom: 10,
    marginTop: -4,
  },
  enrollBtn: {
    height: 42,
    backgroundColor: "#1D9E75",
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 4,
  },
  enrollBtnText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "600",
  },

  // Roster
  rosterHeader: {
    marginBottom: 10,
  },
  rosterLabel: {
    fontSize: 11,
    fontWeight: "600",
    color: "#888780",
    textTransform: "uppercase",
    letterSpacing: 0.6,
  },
  searchWrap: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderWidth: 0.5,
    borderColor: "#D3D1C7",
    borderRadius: 8,
    paddingHorizontal: 10,
    marginBottom: 12,
    height: 38,
  },
  searchIcon: {
    fontSize: 16,
    color: "#888780",
    marginRight: 6,
  },
  searchInput: {
    flex: 1,
    fontSize: 13,
    color: "#2C2C2A",
    height: "100%",
  },

  // Student Card
  studentCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 12,
    borderWidth: 0.5,
    borderColor: "#D3D1C7",
    padding: 14,
    gap: 12,
  },
  studentCardActive: {
    borderLeftWidth: 3,
    borderLeftColor: "#1D9E75",
    borderRadius: 0,
    borderTopRightRadius: 12,
    borderBottomRightRadius: 12,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  avatarActive: { backgroundColor: "#E1F5EE" },
  avatarInactive: { backgroundColor: "#F1EFE8" },
  avatarText: {
    fontSize: 13,
    fontWeight: "600",
  },
  avatarTextActive: { color: "#085041" },
  avatarTextInactive: { color: "#888780" },
  studentInfo: {
    flex: 1,
    gap: 2,
  },
  studentName: {
    fontSize: 14,
    fontWeight: "600",
    color: "#2C2C2A",
  },
  studentMeta: {
    fontSize: 12,
    color: "#888780",
    marginBottom: 4,
  },
  badge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    alignSelf: "flex-start",
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 20,
  },
  badgeActive: { backgroundColor: "#E1F5EE" },
  badgeInactive: { backgroundColor: "#F1EFE8" },
  dot: {
    width: 5,
    height: 5,
    borderRadius: 3,
  },
  dotActive: { backgroundColor: "#0F6E56" },
  dotInactive: { backgroundColor: "#888780" },
  badgeText: {
    fontSize: 11,
    fontWeight: "600",
  },
  badgeTextActive: { color: "#0F6E56" },
  badgeTextInactive: { color: "#888780" },
  cardActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    flexShrink: 0,
  },
  deleteBtn: {
    width: 30,
    height: 30,
    borderRadius: 6,
    borderWidth: 0.5,
    borderColor: "#D3D1C7",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "transparent",
  },
  deleteBtnText: {
    fontSize: 12,
    color: "#888780",
  },

  // Empty
  emptyState: {
    alignItems: "center",
    paddingVertical: 32,
  },
  emptyText: {
    fontSize: 13,
    color: "#888780",
  },

  // Modals
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "flex-end",
  },
  modalSheet: {
    backgroundColor: "#fff",
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    padding: 16,
    maxHeight: "70%",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 14,
    paddingBottom: 12,
    borderBottomWidth: 0.5,
    borderBottomColor: "#D3D1C7",
  },
  modalTitle: {
    fontSize: 15,
    fontWeight: "600",
    color: "#2C2C2A",
  },
  modalClose: {
    fontSize: 14,
    color: "#888780",
    padding: 4,
  },
  modalOption: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 13,
    paddingHorizontal: 4,
    borderBottomWidth: 0.5,
    borderBottomColor: "#F1EFE8",
  },
  modalOptionSelected: {
    backgroundColor: "#E1F5EE",
    borderRadius: 8,
    paddingHorizontal: 10,
    marginHorizontal: -6,
  },
  modalOptionText: {
    fontSize: 14,
    color: "#2C2C2A",
  },
  modalOptionTextSelected: {
    color: "#0F6E56",
    fontWeight: "600",
  },
  checkmark: {
    fontSize: 14,
    color: "#1D9E75",
    fontWeight: "600",
  },
});
