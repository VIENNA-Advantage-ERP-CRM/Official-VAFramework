/********************************************************
 * Project Name   : VIS
 * Class Name     : KJSDocEngine
 * Purpose        : Late bound bridge to the rich document engine that lives in the
 *                  optional KJS module (KJS.dll). Every Syncfusion type used by the
 *                  document editor stays inside KJS - the framework resolves the
 *                  engine through reflection, so VIS carries no Syncfusion assembly
 *                  reference and still builds and runs when KJS is not deployed.
 * Chronological    Development
 * Harwinder
  ******************************************************/


using System;
using System.Reflection;
using System.Runtime.ExceptionServices;
using VAdvantage.Logging;

namespace VIS.Helpers
{
    public static class KJSDocEngine
    {
        /// <summary>Assembly that carries the document engine.</summary>
        private const string ASSEMBLY_NAME = "KJS";

        /// <summary>Facade type inside KJS - exposes primitive parameters/returns only.</summary>
        private const string ENGINE_TYPE_NAME = "KJS.SyncfusionDocEngine";

        /// <summary>Prefix KJS puts in front of a failure message instead of throwing.</summary>
        public const string ERROR_PREFIX = "ERROR: ";

        private static readonly object _lock = new object();
        private static volatile bool _probed = false;
        private static Type _engine = null;
        private static MethodInfo _convertHtmlToSfdt = null;
        private static MethodInfo _convertSfdtToHtml = null;
        private static MethodInfo _htmlToPdfBytes = null;

        /// <summary>
        /// True when KJS.dll is deployed and exposes the document engine.
        /// </summary>
        public static bool IsAvailable
        {
            get
            {
                Probe();
                return _engine != null;
            }
        }

        /// <summary>
        /// Converts HTML into the SFDT json consumed by the document editor.
        /// </summary>
        /// <param name="htmlContent">html to convert</param>
        /// <returns>SFDT json, or an "ERROR: ..." message when the conversion failed</returns>
        public static string ConvertHtmlToSfdt(string htmlContent)
        {
            Probe();
            if (_convertHtmlToSfdt == null)
            {
                return ERROR_PREFIX + NOT_AVAILABLE;
            }
            return Convert.ToString(Invoke(_convertHtmlToSfdt, htmlContent));
        }

        /// <summary>
        /// Converts the editor's SFDT json back into the html held by the document body.
        /// </summary>
        /// <param name="sfdtContent">SFDT json</param>
        /// <returns>body html, or an "ERROR: ..." message when the conversion failed</returns>
        public static string ConvertSfdtToHtml(string sfdtContent)
        {
            Probe();
            if (_convertSfdtToHtml == null)
            {
                return ERROR_PREFIX + NOT_AVAILABLE;
            }
            return Convert.ToString(Invoke(_convertSfdtToHtml, sfdtContent));
        }

        /// <summary>
        /// Renders html to PDF. Segments separated by ~ are laid out on their own page.
        /// </summary>
        /// <param name="html">html, ~ separated when more than one page is wanted</param>
        /// <param name="isRtl">true to lay the document out right to left</param>
        /// <returns>pdf bytes</returns>
        public static byte[] HtmlToPdfBytes(string html, bool isRtl)
        {
            Probe();
            if (_htmlToPdfBytes == null)
            {
                throw new InvalidOperationException(NOT_AVAILABLE);
            }
            return (byte[])Invoke(_htmlToPdfBytes, html, isRtl);
        }

        /// <summary>
        /// Tells whether a value returned by this class carries a failure message.
        /// </summary>
        public static bool IsError(string result)
        {
            return result != null && result.StartsWith(ERROR_PREFIX, StringComparison.Ordinal);
        }

        /// <summary>
        /// Failure message held by a result, without the "ERROR: " prefix.
        /// </summary>
        public static string GetErrorMessage(string result)
        {
            return IsError(result) ? result.Substring(ERROR_PREFIX.Length) : "";
        }

        private const string NOT_AVAILABLE = "Document engine is not available, the KJS module is not deployed";

        /// <summary>
        /// Resolves the engine once per application life time. A missing module is not an
        /// error - the caller decides how to behave when the feature is not installed.
        /// </summary>
        private static void Probe()
        {
            if (_probed)
            {
                return;
            }

            lock (_lock)
            {
                if (_probed)
                {
                    return;
                }

                try
                {
                    Assembly asm = Assembly.Load(ASSEMBLY_NAME);
                    _engine = asm.GetType(ENGINE_TYPE_NAME, false);
                    if (_engine == null)
                    {
                        VLogger.Get().Info(ENGINE_TYPE_NAME + " not found in " + ASSEMBLY_NAME + ", document editor disabled");
                    }
                    else
                    {
                        _convertHtmlToSfdt = GetStaticMethod("ConvertHtmlToSfdt", typeof(string));
                        _convertSfdtToHtml = GetStaticMethod("ConvertSfdtToHtml", typeof(string));
                        _htmlToPdfBytes = GetStaticMethod("HtmlToPdfBytes", typeof(string), typeof(bool));
                    }
                }
                catch (Exception ex)
                {
                    _engine = null;
                    VLogger.Get().Info(ASSEMBLY_NAME + " module not loaded, document editor disabled => " + ex.Message);
                }

                _probed = true;
            }
        }

        private static MethodInfo GetStaticMethod(string name, params Type[] parameterTypes)
        {
            MethodInfo method = _engine.GetMethod(name, BindingFlags.Public | BindingFlags.Static, null, parameterTypes, null);
            if (method == null)
            {
                VLogger.Get().Severe(ENGINE_TYPE_NAME + "." + name + " not found, signature changed in " + ASSEMBLY_NAME);
            }
            return method;
        }

        /// <summary>
        /// Invokes a resolved method and rethrows what KJS threw instead of the
        /// TargetInvocationException reflection wraps it in.
        /// </summary>
        private static object Invoke(MethodInfo method, params object[] args)
        {
            try
            {
                return method.Invoke(null, args);
            }
            catch (TargetInvocationException ex)
            {
                if (ex.InnerException != null)
                {
                    ExceptionDispatchInfo.Capture(ex.InnerException).Throw();
                }
                throw;
            }
        }
    }
}
