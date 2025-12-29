"use client";

import { useState } from "react";
import { Search, X, AlertCircle, Sparkles, Activity } from "lucide-react";

export default function PredictModel() {
    const [selectedSymptoms, setSelectedSymptoms] = useState([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [predictions, setPredictions] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [showSuggestions, setShowSuggestions] = useState(false);

    const symptoms = [
        "abdominal_pain", "abnormal_menstruation", "acidity", "acute_liver_failure", "altered_sensorium",
        "anxiety", "back_pain", "belly_pain", "blackheads", "bladder_discomfort", "blister",
        "blood_in_sputum", "bloody_stool", "blurred_and_distorted_vision", "breathlessness",
        "brittle_nails", "bruising", "burning_micturition", "chest_pain", "chills",
        "cold_hands_and_feet", "coma", "congestion", "constipation", "continuous_feel_of_urine",
        "continuous_sneezing", "cough", "cramps", "dark_urine", "dehydration", "depression",
        "diarrhoea", "dyschromic_patches", "distention_of_abdomen", "dizziness",
        "drying_and_tingling_lips", "enlarged_thyroid", "excessive_hunger", "extra_marital_contacts",
        "family_history", "fast_heart_rate", "fatigue", "fluid_overload", "foul_smell_of urine",
        "headache", "high_fever", "hip_joint_pain", "history_of_alcohol_consumption",
        "increased_appetite", "indigestion", "inflammatory_nails", "internal_itching",
        "irregular_sugar_level", "irritability", "irritation_in_anus", "itching", "joint_pain",
        "knee_pain", "lack_of_concentration", "lethargy", "loss_of_appetite", "loss_of_balance",
        "loss_of_smell", "loss_of_taste", "malaise", "mild_fever", "mood_swings",
        "movement_stiffness", "mucoid_sputum", "muscle_pain", "muscle_wasting", "muscle_weakness",
        "nausea", "neck_pain", "nodal_skin_eruptions", "obesity", "pain_behind_the_eyes",
        "pain_during_bowel_movements", "pain_in_anal_region", "painful_walking", "palpitations",
        "passage_of_gases", "patches_in_throat", "phlegm", "polyuria", "prominent_veins_on_calf",
        "puffy_face_and_eyes", "pus_filled_pimples", "receiving_blood_transfusion",
        "receiving_unsterile_injections", "red_sore_around_nose", "red_spots_over_body",
        "redness_of_eyes", "restlessness", "runny_nose", "rusty_sputum", "scurrying",
        "shivering", "silver_like_dusting", "sinus_pressure", "skin_peeling", "skin_rash",
        "slurred_speech", "small_dents_in_nails", "spinning_movements", "spotting_urination",
        "stiff_neck", "stomach_bleeding", "stomach_pain", "sunken_eyes", "sweating",
        "swelled_lymph_nodes", "swelling_joints", "swelling_of_stomach", "swollen_blood_vessels",
        "swollen_extremities", "swollen_legs", "throat_irritation", "tiredness",
        "toxic_look_(typhus)", "ulcers_on_tongue", "unsteadiness", "visual_disturbances",
        "vomiting", "watering_from_eyes", "weakness_in_limbs", "weakness_of_one_body_side",
        "weight_gain", "weight_loss", "yellow_crust_ooze", "yellow_urine", "yellowing_of_eyes",
        "yellowish_skin"
    ];

    const symptomMapping = {
        "abdominal_pain": ["पेट दर्द", "pet dard", "stomach pain", "पेट में दर्द", "pet me dard", "belly pain"],
        "abnormal_menstruation": ["अनियमित माहवारी", "aniyamit mahavari", "periods problem", "irregular periods", "mc problem"],
        "acidity": ["एसिडिटी", "acidity", "खट्टी डकार", "khatti dakar", "gas problem", "अम्लता", "amlata"],
        "headache": ["सिरदर्द", "sir dard", "headache", "सिर में दर्द", "sir me dard", "head pain"],
        "high_fever": ["तेज बुखार", "tej bukhar", "high fever", "बुखार", "bukhar", "fever"],
        "cough": ["खांसी", "khansi", "cough", "खंखार", "khankhar"],
        "congestion": ["जुकाम", "jukam", "cold", "नाक बंद", "naak band", "congestion", "सर्दी", "sardi"],
        "back_pain": ["कमर दर्द", "kamar dard", "back pain", "पीठ दर्द", "peeth dard"],
        "chest_pain": ["छाती में दर्द", "chati me dard", "chest pain", "सीने में दर्द", "seene me dard"],
        "dizziness": ["चक्कर आना", "chakkar aana", "dizziness", "चक्कर", "chakkar", "dizzy feeling"],
        "nausea": ["जी मिचलाना", "ji michalna", "nausea", "उल्टी आना", "ulti aana", "feel like vomit"],
        "vomiting": ["उल्टी", "ulti", "vomiting", "वमन", "vaman"],
        "diarrhoea": ["दस्त", "dast", "loose motion", "दस्त लगना", "dast lagna", "पतले दस्त", "patle dast"],
        "constipation": ["कब्ज", "kabj", "constipation", "पेट साफ नहीं होना", "pet saaf nahi hona"],
        "fatigue": ["थकान", "thakan", "fatigue", "कमजोरी", "kamjori", "weakness", "आलस", "aalas"],
        "joint_pain": ["जोड़ों में दर्द", "jodon me dard", "joint pain", "घुटने दर्द", "ghutne dard"],
        "muscle_pain": ["मांसपेशी दर्द", "maanspeshi dard", "muscle pain", "बदन दर्द", "badan dard"],
        "breathlessness": ["सांस लेने में तकलीफ", "sans lene me takleef", "breathing problem", "सांस फूलना", "sans foolna"],
        "anxiety": ["चिंता", "chinta", "anxiety", "घबराहट", "ghabrahat", "tension"],
        "depression": ["अवसाद", "avsad", "depression", "उदासी", "udasi", "mood off"],
        "loss_of_appetite": ["भूख न लगना", "bhook na lagna", "no appetite", "खाना नहीं लगता", "khana nahi lagta"],
        "skin_rash": ["चकत्ते", "chakatte", "skin rash", "खुजली", "khujali", "दाने", "dane"],
        "itching": ["खुजली", "khujali", "itching", "खारिश", "kharish"],
        "swelling_joints": ["सूजन", "soojan", "swelling", "जोड़ों में सूजन", "jodon me soojan"],
        "weight_loss": ["वजन कम होना", "vajan kam hona", "weight loss", "वजन घटना", "vajan ghatna"],
        "weight_gain": ["वजन बढ़ना", "vajan badhna", "weight gain", "मोटापा", "motapa"],
        "chills": ["कपकपी", "kapkapi", "chills", "ठंड लगना", "thand lagna"],
        "sweating": ["पसीना आना", "paseena aana", "sweating", "पसीना", "paseena"],
        "runny_nose": ["नाक बहना", "naak bahna", "runny nose", "नाक से पानी", "naak se paani"],
        "throat_irritation": ["गले में खराश", "gale me kharash", "sore throat", "गला दुखना", "gala dukhna"],
        "burning_micturition": ["पेशाब में जलन", "peshab me jalan", "burning urination", "सूजन पेशाब", "soojan peshab"],
        "dark_urine": ["गहरे रंग का पेशाब", "gehre rang ka peshab", "dark urine", "पीला पेशाब", "peela peshab"],
        "stomach_pain": ["पेट दर्द", "pet dard", "stomach pain", "पेट में दर्द", "pet me dard", "pat dard"],
        "knee_pain": ["घुटने में दर्द", "ghutne me dard", "knee pain", "घुटना दुखना", "ghutna dukhna"],
        "neck_pain": ["गर्दन दर्द", "gardan dard", "neck pain", "गर्दन में दर्द", "gardan me dard"],
        "loss_of_smell": ["सूंघने की शक्ति खोना", "sunghne ki shakti khona", "loss of smell", "नाक से महक नहीं आना"],
        "loss_of_taste": ["स्वाद न आना", "swaad na aana", "loss of taste", "जीभ का स्वाद खोना", "jeebh ka swaad khona"],
        "irregular_sugar_level": ["शुगर अनियमित", "sugar aniyamit", "sugar problem", "diabetes", "मधुमेह", "madhumeh"],
        "blurred_and_distorted_vision": ["धुंधला दिखना", "dhundhla dikhna", "blurred vision", "आंखों से धुंधला दिखना"],
        "redness_of_eyes": ["आंखों में लालिमा", "aankhon me laalima", "red eyes", "आंख लाल होना", "aankh laal hona"],
        "excessive_hunger": ["ज्यादा भूख लगना", "jyada bhook lagna", "excessive hunger", "भूख ज्यादा लगना"],
        "mood_swings": ["मूड बदलना", "mood badalna", "mood swings", "मिजाज बदलना", "mijaj badalna"],
        "restlessness": ["बेचैनी", "bechaini", "restlessness", "असहजता", "asahjata"],
        "lethargy": ["सुस्ती", "susti", "lethargy", "आलस्य", "aalasya"],
        "dehydration": ["निर्जलीकरण", "nirjaleekaran", "dehydration", "पानी की कमी", "paani ki kami"],
        "sunken_eyes": ["धंसी हुई आंखें", "dhansi hui aankhein", "sunken eyes", "आंखें अंदर धंसना"],
        "palpitations": ["दिल की धड़कन तेज", "dil ki dhadkan tej", "palpitations", "हृदय गति तेज", "hriday gati tej"],
        "indigestion": ["अपचन", "apachan", "indigestion", "पेट की गैस", "pet ki gas"],
        "cramps": ["ऐंठन", "ainthan", "cramps", "मरोड़", "marod"],
        "malaise": ["अस्वस्थता", "asvasthata", "malaise", "बेचैनी", "bechaini"],
        "irritability": ["चिड़चिड़ाहट", "chidchidahat", "irritability", "गुस्सा", "gussa"],
        "phlegm": ["कफ", "kaph", "phlegm", "बलगम", "balgam"],
        "mucoid_sputum": ["कफ निकलना", "kaph nikalna", "mucoid sputum", "बलगम निकलना", "balgam nikalna"],
        "rusty_sputum": ["मवाद वाला कफ", "mawaad wala kaph", "rusty sputum", "खून वाला बलगम"],
        "blood_in_sputum": ["कफ में खून", "kaph me khoon", "blood in sputum", "बलगम में खून", "balgam me khoon"],
        "bloody_stool": ["मल में खून", "mal me khoon", "bloody stool", "खूनी दस्त", "khooni dast"],
        "yellow_urine": ["पीला पेशाब", "peela peshab", "yellow urine", "पीले रंग का पेशाब"],
        "foul_smell_of urine": ["पेशाब में बदबू", "peshab me badboo", "foul smell urine", "पेशाब से गंध"],
        "polyuria": ["बार बार पेशाब आना", "baar baar peshab aana", "frequent urination", "ज्यादा पेशाब आना"],
        "continuous_feel_of_urine": ["बार बार पेशाब लगना", "baar baar peshab lagna", "continuous urge to urinate"],
        "spotting_urination": ["पेशाब में दाग", "peshab me daag", "spotting urination", "पेशाब रुक रुक कर"],
        "pain_during_bowel_movements": ["शौच में दर्द", "shauch me dard", "pain during stool", "मल त्याग में दर्द"],
        "pain_in_anal_region": ["गुदा में दर्द", "guda me dard", "anal pain", "मलद्वार में दर्द"],
        "irritation_in_anus": ["गुदा में जलन", "guda me jalan", "anal irritation", "मलद्वार में खुजली"],
        "passage_of_gases": ["गैस निकलना", "gas nikalna", "gas problem", "पेट फूलना", "pet foolna"],
        "distention_of_abdomen": ["पेट फूलना", "pet foolna", "abdominal distension", "पेट में सूजन"],
        "swelling_of_stomach": ["पेट में सूजन", "pet me soojan", "stomach swelling", "पेट बढ़ना"],
        "stomach_bleeding": ["पेट से खून आना", "pet se khoon aana", "stomach bleeding", "आंतरिक रक्तस्राव"],
        "internal_itching": ["अंदरूनी खुजली", "androoni khujali", "internal itching", "भीतरी खारिश"],
        "toxic_look_(typhus)": ["बीमार लगना", "beemar lagna", "toxic appearance", "अस्वस्थ दिखना"],
        "ulcers_on_tongue": ["जीभ पर छाले", "jeebh par chhale", "tongue ulcers", "मुंह में छाले", "munh me chhale"],
        "patches_in_throat": ["गले में दाग", "gale me daag", "throat patches", "गले में सफेद दाग"],
        "enlarged_thyroid": ["थायरॉइड बढ़ना", "thyroid badhna", "enlarged thyroid", "गले में गांठ"],
        "fast_heart_rate": ["दिल की तेज धड़कन", "dil ki tej dhadkan", "fast heartbeat", "हृदय गति तेज"],
        "movement_stiffness": ["जकड़न", "jakdan", "stiffness", "अकड़न", "akdan"],
        "painful_walking": ["चलने में दर्द", "chalne me dard", "painful walking", "पैदल चलने में तकलीफ"],
        "loss_of_balance": ["संतुलन खोना", "santulan khona", "loss of balance", "चक्कर से गिरना"],
        "unsteadiness": ["अस्थिरता", "asthirata", "unsteadiness", "लड़खड़ाना", "ladkhadana"],
        "spinning_movements": ["घूमने का अहसास", "ghumne ka ahsaas", "spinning sensation", "चक्कर महसूस करना"],
        "lack_of_concentration": ["ध्यान न लगना", "dhyan na lagna", "lack of concentration", "फोकस न होना"],
        "altered_sensorium": ["चेतना में बदलाव", "chetna me badlav", "altered consciousness", "होश में कमी"],
        "slurred_speech": ["अस्पष्ट बोली", "aspasht boli", "slurred speech", "जीभ लड़खड़ाना"],
        "visual_disturbances": ["दृष्टि की समस्या", "drishti ki samasya", "vision problems", "देखने में परेशानी"],
        "acute_liver_failure": ["लिवर फेलियर", "liver failure", "यकृत विफलता", "yakrit vifalta"],
        "fluid_overload": ["शरीर में पानी भरना", "sharir me paani bharna", "fluid retention", "सूजन"],
        "coma": ["बेहोशी", "behoshi", "coma", "अचेत अवस्था", "achet avastha"],
        "shivering": ["कांपना", "kaanpna", "shivering", "कपकपी", "kapkapi"],
        "stiff_neck": ["गर्दन में अकड़न", "gardan me akdan", "stiff neck", "गर्दन का अकड़ना"],
        "hip_joint_pain": ["कूल्हे में दर्द", "koolhe me dard", "hip pain", "कमर के जोड़ में दर्द"],
        "swelled_lymph_nodes": ["लसीका ग्रंथि सूजन", "lasika granthi soojan", "swollen glands", "गले की ग्रंथि सूजन"],
        "blackheads": ["ब्लैकहेड्स", "blackheads", "काले धब्बे", "kaale dhabbe"],
        "pus_filled_pimples": ["मवाद वाले दाने", "mawaad wale dane", "pus pimples", "फुंसी"],
        "skin_peeling": ["खाल उतरना", "khaal utarna", "skin peeling", "त्वचा छिलना"],
        "silver_like_dusting": ["चांदी जैसा धूल", "chaandi jaisa dhool", "silver dusting", "सफेद पाउडर जैसा"],
        "small_dents_in_nails": ["नाखूनों में गड्ढे", "naakhunon me gaddhe", "nail dents", "नाखून खराब"],
        "inflammatory_nails": ["नाखूनों में सूजन", "naakhunon me soojan", "nail inflammation", "नाखून में संक्रमण"],
        "brittle_nails": ["नाजुक नाखून", "naajuk naakhun", "brittle nails", "टूटते नाखून"],
        "swollen_blood_vessels": ["नसों में सूजन", "nason me soojan", "swollen veins", "रक्त प्रवाह की समस्या"],
        "prominent_veins_on_calf": ["पिंडली में नसें दिखना", "pindli me nasen dikhna", "visible leg veins"],
        "swollen_extremities": ["हाथ पैर में सूजन", "haath pair me soojan", "swollen hands feet"],
        "swollen_legs": ["पैरों में सूजन", "pairon me soojan", "leg swelling", "पैर फूलना"],
        "bruising": ["चोट के निशान", "chot ke nishan", "bruising", "नील पड़ना"],
        "obesity": ["मोटापा", "motapa", "obesity", "अधिक वजन", "adhik vajan"],
        "receiving_blood_transfusion": ["खून चढ़ाना", "khoon chadhana", "blood transfusion"],
        "receiving_unsterile_injections": ["गंदे इंजेक्शन", "gande injection", "unsterile injection"],
        "extra_marital_contacts": ["विवाहेतर संबंध", "vivahetar sambandh", "extramarital contact"],
        "family_history": ["पारिवारिक इतिहास", "parivarik itihaas", "family history", "खानदानी बीमारी"],
        "history_of_alcohol_consumption": ["शराब का सेवन", "sharab ka sevan", "alcohol history", "दारू पीना"],
        "scurrying": ["तेजी से दौड़ना", "teji se daudna", "scurrying", "भागदौड़"],
        "continuous_sneezing": ["लगातार छींक", "lagatar chheenk", "continuous sneezing", "बार बार छींक आना"],
        "watering_from_eyes": ["आंखों से पानी आना", "aankhon se paani aana", "watery eyes", "आंसू आना"],
        "red_sore_around_nose": ["नाक के आसपास लाल घाव", "naak ke aaspaas laal ghaav", "nose sores"],
        "yellow_crust_ooze": ["पीला मवाद निकलना", "peela mawaad nikalna", "yellow discharge"],
        "nodal_skin_eruptions": ["त्वचा पर दाने", "tvacha par dane", "skin eruptions", "चर्म रोग"],
        "dyschromic_patches": ["त्वचा के धब्बे", "tvacha ke dhabbe", "skin patches", "रंग के धब्बे"],
        "red_spots_over_body": ["शरीर पर लाल दाने", "sharir par laal dane", "red spots", "लाल चकत्ते"],
        "bladder_discomfort": ["मूत्राशय की तकलीफ", "mutrashay ki takleef", "bladder problem"],
        "increased_appetite": ["भूख बढ़ना", "bhook badhna", "increased appetite", "ज्यादा भूख"],
        "muscle_wasting": ["मांसपेशी क्षय", "maanspeshi kshay", "muscle loss", "मांस गलना"],
        "muscle_weakness": ["मांसपेशी कमजोरी", "maanspeshi kamjori", "muscle weakness"],
        "weakness_in_limbs": ["हाथ पैर में कमजोरी", "haath pair me kamjori", "limb weakness"],
        "weakness_of_one_body_side": ["एक तरफ कमजोरी", "ek taraf kamjori", "one side weakness"],
        "cold_hands_and_feet": ["हाथ पैर ठंडे", "haath pair thande", "cold extremities"],
        "drying_and_tingling_lips": ["होंठ सूखना और सुन्न होना", "honth sookhna aur sunn hona", "dry tingling lips"],
        "puffy_face_and_eyes": ["चेहरा और आंख सूजना", "chehra aur aankh soojna", "facial swelling"],
        "yellowing_of_eyes": ["आंखों का पीला होना", "aankhon ka peela hona", "yellow eyes"],
        "yellowish_skin": ["पीली त्वचा", "peeli tvacha", "yellow skin", "पीलिया", "peeliya"],
        "tiredness": ["थकान", "thakan", "tiredness", "थकावट", "thakavat"],
        "pain_behind_the_eyes": ["आंखों के पीछे दर्द", "aankhon ke peeche dard", "eye pain"],
        "sinus_pressure": ["साइनस प्रेशर", "sinus pressure", "नाक में दबाव", "naak me dabaav"],
        "blister": ["छाला", "chhala", "blister", "फफोला", "fafola"],
        "mild_fever": ["हल्का बुखार", "halka bukhar", "mild fever", "कम बुखार"]
    };

    const formatSymptomDisplay = (symptom) => {
        return symptom.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
    };

    const getFilteredSymptoms = () => {
        if (!searchTerm) return [];

        const searchLower = searchTerm.toLowerCase();
        const matchedSymptoms = [];

        symptoms.forEach(symptom => {
            if (formatSymptomDisplay(symptom).toLowerCase().includes(searchLower)) {
                matchedSymptoms.push(symptom);
                return;
            }

            const mappings = symptomMapping[symptom] || [];
            const hasMatch = mappings.some(mapping =>
                mapping.toLowerCase().includes(searchLower)
            );

            if (hasMatch) {
                matchedSymptoms.push(symptom);
            }
        });

        return matchedSymptoms.filter(symptom => !selectedSymptoms.includes(symptom));
    };

    const filteredSymptoms = getFilteredSymptoms();

    const addSymptom = (symptom) => {
        setSelectedSymptoms([...selectedSymptoms, symptom]);
        setSearchTerm("");
        setShowSuggestions(false);
    };

    const removeSymptom = (symptom) => {
        setSelectedSymptoms(selectedSymptoms.filter(s => s !== symptom));
    };

    const predictDisease = async () => {
        if (selectedSymptoms.length === 0) return;

        setIsLoading(true);
        try {
            const response = await fetch("https://akenzz-health-desk-ai.hf.space/predict-disease/predict", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    symptoms: selectedSymptoms
                }),
            });

            const data = await response.json();
            setPredictions(data);
        } catch (error) {
            console.error("Error:", error);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-cyan-50 to-blue-50 py-8 px-4">
            <div className="max-w-4xl mx-auto">
            
                <div className="text-center mb-10 animate-fade-in">
                    <div className="flex items-center justify-center gap-3 mb-4">
                        <div className="bg-cyan-600 p-3 rounded-2xl shadow-lg">
                            <Activity className="text-white" size={32} />
                        </div>
                        <h1 className="text-4xl font-bold bg-gradient-to-r from-cyan-600 to-blue-600 bg-clip-text text-transparent">
                            AI Symptom Checker
                        </h1>
                    </div>
                    <p className="text-slate-600 text-lg">
                        Select your symptoms to get possible disease predictions powered by AI
                    </p>
                </div>

               
                <div className="bg-white rounded-3xl shadow-2xl p-8 mb-6 border border-slate-100">
                    
                    <div className="mb-6">
                        <label className="block text-sm font-semibold text-slate-700 mb-3">
                            Selected Symptoms ({selectedSymptoms.length})
                        </label>
                        <div className="min-h-[60px] p-4 bg-gradient-to-br from-slate-50 to-cyan-50 rounded-2xl border-2 border-dashed border-cyan-200 transition-all duration-300">
                            {selectedSymptoms.length === 0 ? (
                                <p className="text-slate-400 text-center py-2">No symptoms selected yet</p>
                            ) : (
                                <div className="flex flex-wrap gap-2">
                                    {selectedSymptoms.map((symptom, index) => (
                                        <div
                                            key={symptom}
                                            className="group bg-gradient-to-r from-cyan-600 to-cyan-500 text-white px-4 py-2 rounded-xl flex items-center gap-2 shadow-md hover:shadow-lg transition-all duration-300 transform hover:scale-105 animate-slide-in"
                                            style={{ animationDelay: `${index * 50}ms` }}
                                        >
                                            <span className="font-medium text-sm">
                                                {formatSymptomDisplay(symptom)}
                                            </span>
                                            <button
                                                onClick={() => removeSymptom(symptom)}
                                                className="hover:bg-white/20 rounded-full p-1 transition-colors duration-200"
                                            >
                                                <X size={16} />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>

                    
                    <div className="mb-6 relative">
                        <label className="block text-sm font-semibold text-slate-700 mb-3">
                            Search & Add Symptoms
                        </label>
                        <div className="relative">
                            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-cyan-500" size={20} />
                            <input
                                type="text"
                                value={searchTerm}
                                onChange={(e) => {
                                    setSearchTerm(e.target.value);
                                    setShowSuggestions(e.target.value.length > 0);
                                }}
                                onFocus={() => setShowSuggestions(searchTerm.length > 0)}
                                placeholder="लक्षण खोजें / Search symptoms (e.g., बुखार, headache, pet dard)"
                                className="w-full pl-12 pr-4 py-4 bg-slate-50 border-2 border-slate-200 rounded-2xl focus:outline-none focus:border-cyan-500 focus:bg-white transition-all duration-300 text-slate-700 placeholder-slate-400"
                            />
                        </div>

                        
                        {showSuggestions && filteredSymptoms.length > 0 && (
                            <div className="absolute z-10 w-full mt-2 bg-white rounded-2xl shadow-2xl border border-slate-200 max-h-80 overflow-y-auto animate-slide-down">
                                {filteredSymptoms.slice(0, 10).map((symptom, index) => {
                                    const alternatives = symptomMapping[symptom] || [];
                                    const hindiAlternatives = alternatives.filter(alt =>
                                        /[\u0900-\u097F]/.test(alt)
                                    ).slice(0, 2);

                                    return (
                                        <div
                                            key={symptom}
                                            onClick={() => addSymptom(symptom)}
                                            className="p-4 hover:bg-gradient-to-r hover:from-cyan-50 hover:to-blue-50 cursor-pointer transition-all duration-200 border-b border-slate-100 last:border-b-0 group"
                                            style={{ animationDelay: `${index * 30}ms` }}
                                        >
                                            <div className="font-medium text-slate-800 group-hover:text-cyan-600 transition-colors duration-200">
                                                {formatSymptomDisplay(symptom)}
                                            </div>
                                            {hindiAlternatives.length > 0 && (
                                                <div className="text-sm text-slate-500 mt-1">
                                                    {hindiAlternatives.join(', ')}
                                                </div>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>

                   
                    <button
                        onClick={predictDisease}
                        disabled={selectedSymptoms.length === 0 || isLoading}
                        className="w-full bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700 disabled:from-slate-300 disabled:to-slate-400 text-white font-semibold py-4 rounded-2xl transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98] disabled:cursor-not-allowed disabled:transform-none shadow-lg hover:shadow-xl flex items-center justify-center gap-2"
                    >
                        {isLoading ? (
                            <>
                                <div className="w-5 h-5 border-3 border-white border-t-transparent rounded-full animate-spin" />
                                <span>Analyzing Symptoms...</span>
                            </>
                        ) : (
                            <>
                                <Sparkles size={20} />
                                <span>Check Symptoms with AI</span>
                            </>
                        )}
                    </button>
                </div>

               
                {predictions && (
                    <div className="bg-white rounded-3xl shadow-2xl p-8 border border-slate-100 animate-slide-up">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="bg-gradient-to-r from-cyan-600 to-blue-600 p-2 rounded-xl">
                                <Activity className="text-white" size={24} />
                            </div>
                            <h3 className="text-2xl font-bold text-slate-800">
                                Possible Conditions
                            </h3>
                        </div>

                        <div className="space-y-4 mb-6">
                            {predictions.predictions
                                .filter(prediction => prediction.probability > 0)
                                .map((prediction, index) => (
                                    <div
                                        key={prediction.disease}
                                        className="p-5 bg-gradient-to-br from-slate-50 to-cyan-50 rounded-2xl border border-slate-200 hover:border-cyan-300 transition-all duration-300 hover:shadow-md animate-slide-in"
                                        style={{ animationDelay: `${index * 100}ms` }}
                                    >
                                        <div className="flex items-center justify-between mb-3">
                                            <span className="font-semibold text-lg text-slate-800">
                                                {prediction.disease.replace(/_/g, ' ')}
                                            </span>
                                            <span className="text-2xl font-bold text-cyan-600">
                                                {Math.round(prediction.probability)}%
                                            </span>
                                        </div>
                                        <div className="w-full bg-slate-200 rounded-full h-3 overflow-hidden">
                                            <div
                                                className="h-full bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full transition-all duration-1000 ease-out shadow-sm"
                                                style={{
                                                    width: `${Math.round(prediction.probability)}%`,
                                                    animationDelay: `${index * 100}ms`
                                                }}
                                            />
                                        </div>
                                    </div>
                                ))}
                        </div>

                        <div className="bg-gradient-to-r from-amber-50 to-orange-50 border-l-4 border-amber-400 p-5 rounded-2xl">
                            <div className="flex gap-3">
                                <AlertCircle className="text-amber-600 flex-shrink-0 mt-0.5" size={20} />
                                <div>
                                    <p className="font-semibold text-amber-900 mb-1">
                                        Important Medical Disclaimer
                                    </p>
                                    <p className="text-sm text-amber-800 leading-relaxed">
                                        This is an AI-powered prediction tool for informational purposes only. 
                                        It is not a substitute for professional medical advice, diagnosis, or treatment. 
                                        Always consult a qualified healthcare professional for proper medical evaluation.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            <style jsx>{`
                @keyframes slide-in {
                    from {
                        opacity: 0;
                        transform: translateY(10px);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0);
                    }
                }

                @keyframes slide-down {
                    from {
                        opacity: 0;
                        transform: translateY(-10px);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0);
                    }
                }

                @keyframes slide-up {
                    from {
                        opacity: 0;
                        transform: translateY(20px);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0);
                    }
                }

                @keyframes fade-in {
                    from {
                        opacity: 0;
                    }
                    to {
                        opacity: 1;
                    }
                }

                .animate-slide-in {
                    animation: slide-in 0.3s ease-out forwards;
                }

                .animate-slide-down {
                    animation: slide-down 0.2s ease-out;
                }

                .animate-slide-up {
                    animation: slide-up 0.4s ease-out;
                }

                .animate-fade-in {
                    animation: fade-in 0.6s ease-out;
                }
            `}</style>
        </div>
    );
}