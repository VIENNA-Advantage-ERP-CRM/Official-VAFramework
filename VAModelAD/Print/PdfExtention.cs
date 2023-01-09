using System;
using System.Collections.Generic;
using System.Globalization;
using System.Linq;
using System.Text;
using System.Text.RegularExpressions;

namespace PdfUnicodeGlyphsResharper
{    
    /// <summary>
    /// Arabic conversion
    /// VIS0228 06-Jan-2023
    /// </summary>
    public static class PdfExtention
    {
        private static Dictionary<string, string[]> _ArabicGlyphs;

        static Regex _RegIsEnglish = new Regex("^[a-zA-Z0-9\\.,!@#$%\\^&\\*\\?()<>{}|'\"\\-_]*$");
        static PdfExtention()
        {
            _ArabicGlyphs = InitializeTableUnicode();
        }
        public static Dictionary<string, string[]> GetArabicGlyphs() 
        {
            return _ArabicGlyphs;
        }
        private static Dictionary<string, string[]> InitializeTableUnicode()
        {
            //For more information https://en.wikipedia.org/wiki/Arabic_script_in_Unicode
            //key is character shaped unicode, value is unicode of each letter's 4 cases
            var xGlyphs = new Dictionary<string, string[]>();
            xGlyphs = new Dictionary<string, string[]>();
            xGlyphs.Add("\\u0622", new string[] { "\\uFE81", "\\uFE81", "\\uFE82", "\\uFE82", "2" });// (آ) Alef maddah
            xGlyphs.Add("\\u0623", new string[] { "\\uFE83", "\\uFE83", "\\uFE84", "\\uFE84", "2" });// (أ) Alef With Hamza Above
            xGlyphs.Add("\\u0624", new string[] { "\\uFE85", "\\uFE85", "\\uFE86", "\\uFE86", "2" });// (ؤ) Waw With Hamza Above 
            xGlyphs.Add("\\u0625", new string[] { "\\uFE87", "\\uFE87", "\\uFE88", "\\uFE88", "2" });// (إ) Alef With Hamza Below 
            xGlyphs.Add("\\u0626", new string[] { "\\uFE89", "\\uFE8B", "\\uFE8C", "\\uFE8A", "4" });// (ئ) Yeh With Hamza Above 
            xGlyphs.Add("\\u0627", new string[] { "\\u0627", "\\u0627", "\\uFE8E", "\\uFE8E", "2" });// (ا) Alef 
            xGlyphs.Add("\\u0628", new string[] { "\\uFE8F", "\\uFE91", "\\uFE92", "\\uFE90", "4" });// (ب) Beh
            xGlyphs.Add("\\u0629", new string[] { "\\uFE93", "\\uFE93", "\\uFE94", "\\uFE94", "2" });// (ة) Teh Marbuta 
            xGlyphs.Add("\\u062A", new string[] { "\\uFE95", "\\uFE97", "\\uFE98", "\\uFE96", "4" });// (ت) Teh
            xGlyphs.Add("\\u062B", new string[] { "\\uFE99", "\\uFE9B", "\\uFE9C", "\\uFE9A", "4" });// (ث) Theh
            xGlyphs.Add("\\u062C", new string[] { "\\uFE9D", "\\uFE9F", "\\uFEA0", "\\uFE9E", "4" });// (ج) Jeem
            xGlyphs.Add("\\u062D", new string[] { "\\uFEA1", "\\uFEA3", "\\uFEA4", "\\uFEA2", "4" });// (ح) Hah
            xGlyphs.Add("\\u062E", new string[] { "\\uFEA5", "\\uFEA7", "\\uFEA8", "\\uFEA6", "4" });// (خ) Khah
            xGlyphs.Add("\\u062F", new string[] { "\\uFEA9", "\\uFEA9", "\\uFEAA", "\\uFEAA", "2" });// (د) Dal
            xGlyphs.Add("\\u0630", new string[] { "\\uFEAB", "\\uFEAB", "\\uFEAC", "\\uFEAC", "2" });// (ذ) Thal
            xGlyphs.Add("\\u0631", new string[] { "\\uFEAD", "\\uFEAD", "\\uFEAE", "\\uFEAE", "2" });// (ر) Reh
            xGlyphs.Add("\\u0632", new string[] { "\\uFEAF", "\\uFEAF", "\\uFEB0", "\\uFEB0", "2" });// (ز) Zain
            xGlyphs.Add("\\u0633", new string[] { "\\uFEB1", "\\uFEB3", "\\uFEB4", "\\uFEB2", "4" });// (س) Seen
            xGlyphs.Add("\\u0634", new string[] { "\\uFEB5", "\\uFEB7", "\\uFEB8", "\\uFEB6", "4" });// (ش) Sheen
            xGlyphs.Add("\\u0635", new string[] { "\\uFEB9", "\\uFEBB", "\\uFEBC", "\\uFEBA", "4" });// (ص) Sad
            xGlyphs.Add("\\u0636", new string[] { "\\uFEBD", "\\uFEBF", "\\uFEC0", "\\uFEBE", "4" });// (ض) Dad
            xGlyphs.Add("\\u0637", new string[] { "\\uFEC1", "\\uFEC3", "\\uFEC4", "\\uFEC2", "4" });// (ط) Tah
            xGlyphs.Add("\\u0638", new string[] { "\\uFEC5", "\\uFEC7", "\\uFEC8", "\\uFEC6", "4" });// (ظ) Zah
            xGlyphs.Add("\\u0639", new string[] { "\\uFEC9", "\\uFECB", "\\uFECC", "\\uFECA", "4" });// (ع) Ain
            xGlyphs.Add("\\u063A", new string[] { "\\uFECD", "\\uFECF", "\\uFED0", "\\uFECE", "4" });// (غ) Ghain
            xGlyphs.Add("\\u0641", new string[] { "\\uFED1", "\\uFED3", "\\uFED4", "\\uFED2", "4" });// (ف) Feh
            xGlyphs.Add("\\u0642", new string[] { "\\uFED5", "\\uFED7", "\\uFED8", "\\uFED6", "4" });// (ق) Qaf
            xGlyphs.Add("\\u0643", new string[] { "\\uFED9", "\\uFEDB", "\\uFEDC", "\\uFEDA", "4" });// (ك) Kaf
            xGlyphs.Add("\\u0644", new string[] { "\\uFEDD", "\\uFEDF", "\\uFEE0", "\\uFEDE", "4" });// (ل) Lam
            xGlyphs.Add("\\u0645", new string[] { "\\uFEE1", "\\uFEE3", "\\uFEE4", "\\uFEE2", "4" });// (م) Meem
            xGlyphs.Add("\\u0646", new string[] { "\\uFEE5", "\\uFEE7", "\\uFEE8", "\\uFEE6", "4" });// (ن) Noon
            xGlyphs.Add("\\u0647", new string[] { "\\uFEE9", "\\uFEEB", "\\uFEEC", "\\uFEEA", "4" });// (هـ) Heh
            xGlyphs.Add("\\u0648", new string[] { "\\uFEED", "\\uFEED", "\\uFEEE", "\\uFEEE", "2" });// (و) Waw
            xGlyphs.Add("\\u0649", new string[] { "\\uFEEF", "\\uFEEF", "\\uFEF0", "\\uFEF0", "2" });// (ى) Alef Maksura 
            xGlyphs.Add("\\u0671", new string[] { "\\u0671", "\\u0671", "\\uFB51", "\\uFB51", "2" });// (ٱ) Alef Wasla 
            xGlyphs.Add("\\u064A", new string[] { "\\uFEF1", "\\uFEF3", "\\uFEF4", "\\uFEF2", "4" });// (ي) Yeh
            xGlyphs.Add("\\u066E", new string[] { "\\uFBE4", "\\uFBE8", "\\uFBE9", "\\uFBE5", "4" });// (ٮ)  Dotless Beh 
            xGlyphs.Add("\\u06AA", new string[] { "\\uFB8E", "\\uFB90", "\\uFB91", "\\uFB8F", "4" });// (ڪ) Swash Kaf 
            xGlyphs.Add("\\u06C1", new string[] { "\\uFBA6", "\\uFBA8", "\\uFBA9", "\\uFBA7", "4" });// (ه) Heh Goal
            xGlyphs.Add("\\u06E4", new string[] { "\\u06E4", "\\u06E4", "\\u06E4", "\\uFEEE", "2" });// () Small High Madda 
            return xGlyphs;
        }

        private static string GetAsUnicode(this string xShapedText)
        {
            xShapedText = Regex.Unescape(xShapedText.Trim());
            var xWords = xShapedText.Split(' ');
            StringBuilder xBuilder = new StringBuilder();
            foreach (var iWord in xWords)
            {
                for (int i = 0; i < iWord.Length; i++)
                {
                    string xShapedUnicode = @"\u" + ((int)iWord[i]).ToString("X4");
                    xBuilder.Append(xShapedUnicode);
                }
            }
            return xBuilder.ToString();
        }

        private static string GetUnShapedUnicode(this string original)
        {
            //remove escape characters
            original = Regex.Unescape(original.Trim());

            var xWords = original.Split(' ');
            StringBuilder xBuilder = new StringBuilder();
            var xUnicodeTable = GetArabicGlyphs();
            foreach (var iWord in xWords)
            {
                string xPrevious = null;
                int xIndex = 0;
                foreach (var character in iWord)
                {
                    string xShapedUnicode = @"\u" + ((int)character).ToString("X4");

                    //if unicode doesn't exist in unicode table then character isn't a letter hence shaped unicode is fine
                    if (!xUnicodeTable.ContainsKey(xShapedUnicode))
                    {
                        xBuilder.Append(xShapedUnicode);
                        xPrevious = null;
                        continue;
                    }
                    else
                    {
                        //first character in word or previous character isn't a letter
                        if (xIndex == 0 || xPrevious == null)
                        {
                            xBuilder.Append(xUnicodeTable[xShapedUnicode][1]);
                        }
                        else
                        {
                            bool xPreviousCharHasOnlyTwoCases = xUnicodeTable[xPrevious][4] == "2";
                            //if last character in word
                            if (xIndex == iWord.Length - 1)
                            {
                                if (!string.IsNullOrEmpty(xPrevious) && xPreviousCharHasOnlyTwoCases)
                                {
                                    xBuilder.Append(xUnicodeTable[xShapedUnicode][0]);
                                }
                                else
                                    xBuilder.Append(xUnicodeTable[xShapedUnicode][3]);
                            }
                            else
                            {
                                if (xPreviousCharHasOnlyTwoCases)
                                    xBuilder.Append(xUnicodeTable[xShapedUnicode][1]);
                                else
                                    xBuilder.Append(xUnicodeTable[xShapedUnicode][2]);
                            }
                        }
                    }

                    xPrevious = xShapedUnicode;
                    xIndex++;
                }
                //if not last word then add a space unicode
                if (xWords.ToList().IndexOf(iWord) != xWords.Length - 1)
                    xBuilder.Append(@"\u" + ((int)' ').ToString("X4"));
            }

            return xBuilder.ToString();
        }
        // static Regex reUnicode = new Regex(@"\\u([0-9a-fA-F]{4})", RegexOptions.Compiled);

        private static string DecodeEncodedNonAsciiCharacters(this string value)
        {
            //static Regex reUnicode = new Regex(@"\\u([0-9a-fA-F]{4})", RegexOptions.Compiled);
            //return reUnicode.Replace(value, m => string.Format(@"\u{0:x4}", (short)m.Value[0]));
            return Regex.Replace(
                value,
                @"\\u(?<Value>[a-zA-Z0-9]{4})",
                m => ((char)int.Parse(m.Groups["Value"].Value, NumberStyles.HexNumber)).ToString());
        }

        /// <summary>
        /// Reverse String
        /// </summary>
        /// <param name="original"></param>
        /// <returns></returns>
        private static string ReverseString(this string original)
        {
            //to check each word as alone may contain english word and may not
            var xWords = original.Split(' ');

            for (int i = 0; i < xWords.Length; i++)
            {
                var iWord = xWords[i];
                if (!string.IsNullOrEmpty(iWord) && !_RegIsEnglish.IsMatch(iWord))
                {
                    var xArray = iWord.ToCharArray();
                    Array.Reverse(xArray);
                    xWords[i] = new string(xArray);
                }

            }
            //Array.Reverse(xWords);

            return string.Join(" ", xWords);
        }
        public static string FontGlyphsToPfd(this string source)
        {
            return source.GetUnShapedUnicode().DecodeEncodedNonAsciiCharacters().ReverseString();
        }
    }
}
